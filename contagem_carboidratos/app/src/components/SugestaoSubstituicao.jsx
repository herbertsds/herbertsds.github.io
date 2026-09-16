import { useEffect, useMemo, useState } from 'react';
import { Form, Button, ListGroup, Alert, Modal, Collapse } from 'react-bootstrap';
import { ResumoNutricional } from './ResumoNutricional';
import { ListaPaginada } from './ListaPaginada';
import { CandidatoOrcamentoItem } from './CandidatoOrcamentoItem';
import { FiltroOrdenacaoCandidatos } from './FiltroOrdenacaoCandidatos';
import { ItemAlimentoEditavel } from './ItemAlimentoEditavel';
import { calcularItem, calcularTotalItens, formatarNumero } from '../domain/calculos';
import {
  calcularOrcamento,
  calcularUsoCesta,
  classificarCandidato,
  filtrarEOrdenarCandidatos,
} from '../domain/substituicao';
import { buscarAlimentos } from '../domain/busca';

function textoQuantidade(alimento, quantidade) {
  if (!alimento) return '';
  return alimento.quantidade_indefinida
    ? `${formatarNumero(quantidade, 2)}x ${alimento.medida}`
    : `${formatarNumero(quantidade, 1)} g`;
}

// Monta os grupos de "o que dá pra substituir": um por alimento, nunca um lançamento por vez
// (uma mesma comida pode ter entrado por mais de uma via — ex: veio da sugestão do plano e
// também foi adicionada solta — as quantidades somam num grupo só). "Do plano" inclui todo
// alimento previsto no plano para essa refeição **mesmo que ainda não tenha sido lançado
// hoje** (nesse caso o grupo nasce com a quantidade planejada e itemIds vazio — aplicar uma
// substituição nele não remove nada, só adiciona os substitutos). Um alimento cujo id está no
// plano nunca aparece em "adicionados", mesmo que a linha real tenha entrado por busca livre.
function montarGrupos(itensPrevistos, itensLogados) {
  const idsDoPlano = new Set(itensPrevistos.map((i) => i.alimentoId));
  const porAlimento = new Map();

  for (const previsto of itensPrevistos) {
    porAlimento.set(previsto.alimentoId, {
      alimentoId: previsto.alimentoId,
      quantidadeG: previsto.quantidadeG,
      itemIds: [],
      doPlano: true,
    });
  }

  for (const item of itensLogados) {
    const doPlano = item.origem === 'sugestao-plano' || idsDoPlano.has(item.alimentoId);
    const existente = porAlimento.get(item.alimentoId);
    if (existente && existente.itemIds.length === 0 && doPlano) {
      // Primeiro lançamento real desse alimento do plano: troca a quantidade planejada
      // (que só existia pra mostrar a sugestão) pela quantidade de verdade.
      existente.quantidadeG = item.quantidadeG;
      existente.itemIds = [item.id];
    } else if (existente) {
      existente.quantidadeG += item.quantidadeG;
      existente.itemIds.push(item.id);
    } else {
      porAlimento.set(item.alimentoId, {
        alimentoId: item.alimentoId,
        quantidadeG: item.quantidadeG,
        itemIds: [item.id],
        doPlano,
      });
    }
  }

  return Array.from(porAlimento.values());
}

const textoExplicativoCesta = ({ unidade }) =>
  `Soma ${unidade === 'kcal' ? 'das calorias' : 'dos carboidratos'} dos alimentos já colocados na cesta.`;

// Botão que abre um modal para substituir alimentos dessa refeição (do plano ou lançados
// avulsos) por outros do catálogo, sem estourar o orçamento dos marcados. Fluxo em dois
// passos (dois `Collapse` dentro do mesmo `Modal.Body` — nunca os dois abertos ao mesmo
// tempo): primeiro escolher QUAIS alimentos substituir, depois — já com os toggles Respeitar
// calorias/carboidratos como primeira coisa — buscar substitutos e montar a cesta. O footer
// com os botões de aplicar fica sempre visível nos dois passos, só habilitado de verdade a
// partir do momento que a cesta tem algo. `meta` (a meta da refeição inteira, não o orçamento
// da substituição) alimenta a prévia no fim do passo 2.
export function SugestaoSubstituicao({ refeicao, itensPrevistos, alimentos, alimentosPorId, meta, onAplicar }) {
  const [aberto, setAberto] = useState(false);
  const [etapa, setEtapa] = useState('escolher'); // 'escolher' | 'substitutos'
  const [idsParaSubstituir, setIdsParaSubstituir] = useState(new Set());
  const [respeitarCalorias, setRespeitarCalorias] = useState(true);
  const [respeitarCarboidratos, setRespeitarCarboidratos] = useState(true);
  const [cesta, setCesta] = useState([]);
  const [consultaCatalogo, setConsultaCatalogo] = useState('');
  const [filtro, setFiltro] = useState('todos');
  const [ordenarPor, setOrdenarPor] = useState(null);
  const [direcao, setDirecao] = useState('asc');
  const [mensagem, setMensagem] = useState(null);
  const [recemAdicionadoId, setRecemAdicionadoId] = useState(null);

  // Some sozinho depois de 1 minuto, ou na hora se outro item for adicionado (o efeito
  // anterior é cancelado antes desse rodar) — e rola até o cartão assim que ele existe.
  useEffect(() => {
    if (!recemAdicionadoId) return;
    const frame = requestAnimationFrame(() => {
      document.getElementById(`cesta-${recemAdicionadoId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    const timer = setTimeout(() => setRecemAdicionadoId(null), 60000);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, [recemAdicionadoId]);

  const grupos = useMemo(
    () => montarGrupos(itensPrevistos, refeicao.itens),
    [itensPrevistos, refeicao.itens],
  );
  const gruposDoPlano = grupos.filter((g) => g.doPlano);
  const gruposAdicionados = grupos.filter((g) => !g.doPlano);

  const gruposSelecionados = grupos.filter((g) => idsParaSubstituir.has(g.alimentoId));
  const orcamento = calcularOrcamento(gruposSelecionados, alimentosPorId);
  const usoCesta = calcularUsoCesta(cesta, alimentosPorId);

  const candidatos = useMemo(() => {
    // Sem limite artificial: a lista completa que bate com a busca entra na paginação,
    // exaustiva de verdade (não só os N melhores resultados).
    const filtrados = buscarAlimentos(alimentos, consultaCatalogo, alimentos.length);
    const classificados = filtrados
      .filter((alimento) => !cesta.some((c) => c.alimentoId === alimento.id))
      .map((alimento) =>
        classificarCandidato(alimento, usoCesta, orcamento, {
          calorias: respeitarCalorias,
          carboidratos: respeitarCarboidratos,
        }),
      );
    return filtrarEOrdenarCandidatos(classificados, { filtro, ordenarPor, direcao });
  }, [
    alimentos,
    consultaCatalogo,
    cesta,
    usoCesta,
    orcamento,
    respeitarCalorias,
    respeitarCarboidratos,
    filtro,
    ordenarPor,
    direcao,
  ]);

  // Prévia de como a refeição ficaria — assumindo o clique em "Substituir os itens
  // marcados" (o cenário mais informativo: remove os originais marcados E soma a cesta).
  const idsParaRemoverPreview = gruposSelecionados.flatMap((g) => g.itemIds);
  const itensRestantesPreview = refeicao.itens.filter((i) => !idsParaRemoverPreview.includes(i.id));
  const totalRestantesPreview = calcularTotalItens(itensRestantesPreview, alimentosPorId);
  const totalPreview = {
    kcal: totalRestantesPreview.kcal + usoCesta.kcal,
    cho: totalRestantesPreview.cho + usoCesta.cho,
  };

  function alternarGrupo(alimentoId) {
    setIdsParaSubstituir((atual) => {
      const novo = new Set(atual);
      if (novo.has(alimentoId)) novo.delete(alimentoId);
      else novo.add(alimentoId);
      return novo;
    });
    setCesta([]);
    setMensagem(null);
  }

  function adicionarNaCesta(alimento, quantidadeTeste) {
    setCesta((atual) => [...atual, { alimentoId: alimento.id, quantidadeG: quantidadeTeste }]);
    setRecemAdicionadoId(alimento.id);
  }

  function atualizarQuantidadeCesta(alimentoId, novaQuantidade) {
    setCesta((atual) =>
      atual.map((c) => (c.alimentoId === alimentoId ? { ...c, quantidadeG: novaQuantidade } : c)),
    );
  }

  function removerDaCesta(alimentoId) {
    setCesta((atual) => atual.filter((c) => c.alimentoId !== alimentoId));
  }

  function aplicar(substituir) {
    const novosItens = cesta.map((c) => ({ alimentoId: c.alimentoId, quantidadeG: c.quantidadeG }));
    const idsParaRemover = substituir ? gruposSelecionados.flatMap((g) => g.itemIds) : [];
    onAplicar(refeicao.id, idsParaRemover, novosItens);
    setMensagem(substituir ? 'Itens substituídos.' : 'Itens adicionados.');
    setCesta([]);
    setIdsParaSubstituir(new Set());
    setEtapa('escolher');
    setRecemAdicionadoId(null);
  }

  function fechar() {
    setAberto(false);
    setEtapa('escolher');
    setCesta([]);
    setIdsParaSubstituir(new Set());
    setConsultaCatalogo('');
    setMensagem(null);
    setRecemAdicionadoId(null);
  }

  function renderGrupo(grupo) {
    const alimento = alimentosPorId.get(grupo.alimentoId);
    const { kcal, cho } = calcularItem(grupo, alimentosPorId);
    return (
      <ListGroup.Item key={grupo.alimentoId}>
        <Form.Check
          type="switch"
          id={`sub-${refeicao.id}-${grupo.alimentoId}`}
          checked={idsParaSubstituir.has(grupo.alimentoId)}
          onChange={() => alternarGrupo(grupo.alimentoId)}
          label={
            alimento ? (
              <>
                <span className="fw-semibold">{alimento.alimento}</span> (
                {textoQuantidade(alimento, grupo.quantidadeG)}){' '}
                <span className="text-muted">
                  — {Math.round(kcal)} kcal · {formatarNumero(cho)} g CHO
                </span>
              </>
            ) : (
              'Alimento removido'
            )
          }
        />
      </ListGroup.Item>
    );
  }

  return (
    <div className="mt-3 border-top pt-3">
      <Button variant="outline-secondary" size="sm" onClick={() => setAberto(true)}>
        Sugerir substituição
      </Button>

      <Modal show={aberto} onHide={fechar} centered size="lg" scrollable>
        <Modal.Header closeButton>
          <Modal.Title>Substituir alimentos — {refeicao.tipo}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {grupos.length === 0 ? (
            <div className="text-muted small">
              Não há alimentos previstos ou lançados nessa refeição para substituir.
            </div>
          ) : (
            <>
              <Collapse in={etapa === 'escolher'}>
                <div>
                  <div className="small text-muted mb-2">Passo 1 de 2 — o que substituir</div>
                  {gruposDoPlano.length > 0 && (
                    <>
                      <div className="fw-semibold small mb-1">Alimentos do plano</div>
                      <ListGroup className="subsecao mb-3">{gruposDoPlano.map(renderGrupo)}</ListGroup>
                    </>
                  )}
                  {gruposAdicionados.length > 0 && (
                    <>
                      <div className="fw-semibold small mb-1">Alimentos adicionados</div>
                      <ListGroup className="subsecao mb-3">{gruposAdicionados.map(renderGrupo)}</ListGroup>
                    </>
                  )}

                  <Button
                    disabled={idsParaSubstituir.size === 0}
                    onClick={() => setEtapa('substitutos')}
                  >
                    Avançar
                  </Button>
                </div>
              </Collapse>

              <Collapse in={etapa === 'substitutos'}>
                <div>
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 mb-2"
                    onClick={() => setEtapa('escolher')}
                  >
                    ‹ voltar para escolher os alimentos
                  </Button>
                  <div className="small text-muted mb-2">Passo 2 de 2 — buscar substitutos</div>

                  <div className="d-flex gap-4 mb-3 flex-wrap">
                    <Form.Check
                      type="switch"
                      id={`respeitar-calorias-${refeicao.id}`}
                      label="Respeitar calorias"
                      checked={respeitarCalorias}
                      onChange={(e) => setRespeitarCalorias(e.target.checked)}
                    />
                    <Form.Check
                      type="switch"
                      id={`respeitar-carboidratos-${refeicao.id}`}
                      label="Respeitar carboidratos"
                      checked={respeitarCarboidratos}
                      onChange={(e) => setRespeitarCarboidratos(e.target.checked)}
                    />
                  </div>

                  <div className="mb-2">
                    <ResumoNutricional
                      titulo="Cesta / orçamento da substituição"
                      consumidoKcal={usoCesta.kcal}
                      consumidoCho={usoCesta.cho}
                      metaKcal={orcamento.kcal}
                      metaCho={orcamento.cho}
                      tamanho="compacto"
                      textoExplicativo={textoExplicativoCesta}
                    />
                  </div>

                  {cesta.length > 0 && (
                    <div className="lista-itens-refeicao mb-2">
                      {cesta.map((c) => {
                        const alimento = alimentosPorId.get(c.alimentoId);
                        const usoOutrosCesta = calcularTotalItens(
                          cesta.filter((outro) => outro.alimentoId !== c.alimentoId),
                          alimentosPorId,
                        );
                        return (
                          <ItemAlimentoEditavel
                            key={c.alimentoId}
                            id={`cesta-${c.alimentoId}`}
                            destacarNovo={c.alimentoId === recemAdicionadoId}
                            alimento={alimento}
                            alimentosPorId={alimentosPorId}
                            quantidade={c.quantidadeG}
                            onChangeQuantidade={(novaQuantidade) => atualizarQuantidadeCesta(c.alimentoId, novaQuantidade)}
                            onRemover={() => removerDaCesta(c.alimentoId)}
                            orcamento={orcamento}
                            usoOutros={usoOutrosCesta}
                            respeitarCalorias={respeitarCalorias}
                            respeitarCarboidratos={respeitarCarboidratos}
                          />
                        );
                      })}
                    </div>
                  )}

                  <Form.Control
                    className="mb-2"
                    placeholder="Buscar alimento substituto..."
                    value={consultaCatalogo}
                    onChange={(e) => setConsultaCatalogo(e.target.value)}
                  />

                  <FiltroOrdenacaoCandidatos
                    filtro={filtro}
                    onFiltroChange={setFiltro}
                    ordenarPor={ordenarPor}
                    onOrdenarPorChange={setOrdenarPor}
                    direcao={direcao}
                    onDirecaoChange={setDirecao}
                  />

                  <ListaPaginada
                    itens={candidatos}
                    itensPorPagina={5}
                    resetKey={`${consultaCatalogo}|${filtro}|${ordenarPor}|${direcao}`}
                    renderItem={(c) => (
                      <CandidatoOrcamentoItem
                        key={c.alimento.id}
                        candidato={c}
                        onSelecionar={(alimento, quantidade) => adicionarNaCesta(alimento, quantidade)}
                      />
                    )}
                  />

                  {meta && (idsParaRemoverPreview.length > 0 || cesta.length > 0) && (
                    <div className="mt-3 pt-3 border-top">
                      <div className="small text-muted mb-1">
                        Prévia — como ficaria essa refeição ao "Substituir os itens marcados":
                      </div>
                      <div className="subsecao p-2 small">
                        {itensRestantesPreview.length === 0 && cesta.length === 0 && (
                          <div className="text-muted">A refeição ficaria sem nenhum alimento.</div>
                        )}
                        {itensRestantesPreview.map((i) => {
                          const a = alimentosPorId.get(i.alimentoId);
                          return a ? <div key={i.id}>{a.alimento}</div> : null;
                        })}
                        {cesta.map((c) => {
                          const a = alimentosPorId.get(c.alimentoId);
                          return a ? (
                            <div key={c.alimentoId} className="text-success">
                              {a.alimento} (novo)
                            </div>
                          ) : null;
                        })}
                        <div className="mt-2 fw-semibold text-muted">
                          Total previsto: {Math.round(totalPreview.kcal)} kcal · {formatarNumero(totalPreview.cho)} g CHO
                          {' '}(meta da refeição: {Math.round(meta.kcal)} kcal · {formatarNumero(meta.cho)} g CHO)
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Collapse>
            </>
          )}
        </Modal.Body>

        <Modal.Footer className="d-flex flex-column align-items-stretch gap-2">
          {mensagem && (
            <Alert variant="success" className="mb-0 py-1 small">
              {mensagem}
            </Alert>
          )}
          <div className="d-flex gap-2 flex-wrap">
            <Button
              disabled={idsParaSubstituir.size === 0 || cesta.length === 0}
              onClick={() => aplicar(true)}
            >
              Substituir os itens marcados
            </Button>
            <Button
              variant="outline-primary"
              disabled={idsParaSubstituir.size === 0 || cesta.length === 0}
              onClick={() => aplicar(false)}
            >
              Manter os itens e adicionar os novos
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
