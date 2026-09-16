import { useMemo, useState } from 'react';
import { Form, Button, ListGroup, Badge, Alert, Modal } from 'react-bootstrap';
import { QuantidadeDupla } from './QuantidadeDupla';
import { ResumoNutricional } from './ResumoNutricional';
import { calcularItem, arredondar } from '../domain/calculos';
import { calcularOrcamento, calcularUsoCesta, classificarCandidato } from '../domain/substituicao';
import { buscarAlimentos } from '../domain/busca';

function textoQuantidade(alimento, quantidade) {
  if (!alimento) return '';
  return alimento.quantidade_indefinida
    ? `${arredondar(quantidade, 2)}x ${alimento.medida}`
    : `${arredondar(quantidade, 1)} g`;
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

// Botão que abre um modal para substituir alimentos dessa refeição (do plano ou lançados
// avulsos) por outros do catálogo, sem estourar o orçamento dos marcados.
export function SugestaoSubstituicao({ refeicao, itensPrevistos, alimentos, alimentosPorId, onAplicar }) {
  const [aberto, setAberto] = useState(false);
  const [idsParaSubstituir, setIdsParaSubstituir] = useState(new Set());
  const [respeitarCalorias, setRespeitarCalorias] = useState(true);
  const [respeitarCarboidratos, setRespeitarCarboidratos] = useState(true);
  const [cesta, setCesta] = useState([]);
  const [consultaCatalogo, setConsultaCatalogo] = useState('');
  const [mensagem, setMensagem] = useState(null);

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
    const filtrados = buscarAlimentos(alimentos, consultaCatalogo, 60);
    return filtrados
      .filter((alimento) => !cesta.some((c) => c.alimentoId === alimento.id))
      .map((alimento) =>
        classificarCandidato(alimento, usoCesta, orcamento, {
          calorias: respeitarCalorias,
          carboidratos: respeitarCarboidratos,
        }),
      );
  }, [alimentos, consultaCatalogo, cesta, usoCesta, orcamento, respeitarCalorias, respeitarCarboidratos]);

  const dentroDoLimite = candidatos.filter((c) => !c.excede);
  const foraDoLimite = candidatos.filter((c) => c.excede);

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
  }

  function fechar() {
    setAberto(false);
    setCesta([]);
    setIdsParaSubstituir(new Set());
    setConsultaCatalogo('');
    setMensagem(null);
  }

  function renderGrupo(grupo) {
    const alimento = alimentosPorId.get(grupo.alimentoId);
    const { kcal, cho } = calcularItem(grupo, alimentosPorId);
    return (
      <ListGroup.Item key={grupo.alimentoId}>
        <Form.Check
          type="switch"
          id={`sub-${grupo.alimentoId}`}
          checked={idsParaSubstituir.has(grupo.alimentoId)}
          onChange={() => alternarGrupo(grupo.alimentoId)}
          label={
            alimento ? (
              <>
                {alimento.alimento} ({textoQuantidade(alimento, grupo.quantidadeG)}){' '}
                <span className="text-muted">
                  — {Math.round(kcal)} kcal · {arredondar(cho)} g CHO
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
              {gruposDoPlano.length > 0 && (
                <>
                  <div className="fw-semibold small mb-1">Alimentos do plano</div>
                  <ListGroup className="mb-3">{gruposDoPlano.map(renderGrupo)}</ListGroup>
                </>
              )}
              {gruposAdicionados.length > 0 && (
                <>
                  <div className="fw-semibold small mb-1">Alimentos adicionados</div>
                  <ListGroup className="mb-3">{gruposAdicionados.map(renderGrupo)}</ListGroup>
                </>
              )}
            </>
          )}

          {idsParaSubstituir.size > 0 && (
            <>
              <div className="d-flex gap-4 mb-2 flex-wrap">
                <Form.Check
                  type="switch"
                  id="respeitar-calorias"
                  label="Respeitar calorias"
                  checked={respeitarCalorias}
                  onChange={(e) => setRespeitarCalorias(e.target.checked)}
                />
                <Form.Check
                  type="switch"
                  id="respeitar-carboidratos"
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
                />
              </div>

              {cesta.length > 0 && (
                <ListGroup className="mb-2">
                  {cesta.map((c) => {
                    const alimento = alimentosPorId.get(c.alimentoId);
                    return (
                      <ListGroup.Item key={c.alimentoId}>
                        <div className="d-flex justify-content-between align-items-center gap-2 mb-2">
                          <span>{alimento?.alimento}</span>
                          <Button
                            size="sm"
                            variant="link"
                            className="text-danger p-0"
                            onClick={() => removerDaCesta(c.alimentoId)}
                          >
                            remover
                          </Button>
                        </div>
                        <QuantidadeDupla
                          alimento={alimento}
                          valor={c.quantidadeG}
                          onChange={(novaQuantidade) => atualizarQuantidadeCesta(c.alimentoId, novaQuantidade)}
                        />
                      </ListGroup.Item>
                    );
                  })}
                </ListGroup>
              )}

              <Form.Control
                className="mb-2"
                placeholder="Buscar alimento substituto..."
                value={consultaCatalogo}
                onChange={(e) => setConsultaCatalogo(e.target.value)}
              />

              <div className="fw-semibold small text-success">Cabem no limite</div>
              <ListGroup className="mb-3" style={{ maxHeight: 220, overflowY: 'auto' }}>
                {dentroDoLimite.slice(0, 20).map((c) => (
                  <ListGroup.Item
                    key={c.alimento.id}
                    action
                    onClick={() => adicionarNaCesta(c.alimento, c.quantidadeTeste)}
                    className="d-flex justify-content-between align-items-center gap-2"
                  >
                    <span>
                      {c.alimento.alimento} <small className="text-muted">({c.alimento.medida})</small>
                    </span>
                    <small className="text-nowrap">
                      {Math.round(c.acrescimoKcal)} kcal · {arredondar(c.acrescimoCho)} g CHO
                    </small>
                  </ListGroup.Item>
                ))}
                {dentroDoLimite.length === 0 && (
                  <ListGroup.Item className="text-muted small">Nada encontrado.</ListGroup.Item>
                )}
              </ListGroup>

              <div className="fw-semibold small text-danger">Ultrapassam o limite</div>
              <ListGroup className="mb-3" style={{ maxHeight: 220, overflowY: 'auto' }}>
                {foraDoLimite.slice(0, 20).map((c) => (
                  <ListGroup.Item
                    key={c.alimento.id}
                    action
                    onClick={() => adicionarNaCesta(c.alimento, c.quantidadeTeste)}
                  >
                    <div className="d-flex justify-content-between align-items-center gap-2">
                      <span>{c.alimento.alimento}</span>
                      <Badge bg="danger" className="text-nowrap">
                        {c.excedeKcalEm > 0 && `+${Math.round(c.excedeKcalEm)} kcal `}
                        {c.excedeChoEm > 0 && `+${arredondar(c.excedeChoEm)} g CHO`}
                      </Badge>
                    </div>
                    <small className="text-muted d-block mt-1">
                      {Math.round(c.acrescimoKcal)} kcal · {arredondar(c.acrescimoCho)} g CHO na medida
                      usual — máximo pra não passar:{' '}
                      {c.alimento.quantidade_indefinida
                        ? `${arredondar(c.quantidadeMaximaMedidas, 2)}x ${c.alimento.medida}`
                        : `${arredondar(c.quantidadeMaximaG, 1)} g (${arredondar(c.quantidadeMaximaMedidas, 2)}x ${c.alimento.medida})`}
                    </small>
                  </ListGroup.Item>
                ))}
                {foraDoLimite.length === 0 && (
                  <ListGroup.Item className="text-muted small">Nada encontrado.</ListGroup.Item>
                )}
              </ListGroup>
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
