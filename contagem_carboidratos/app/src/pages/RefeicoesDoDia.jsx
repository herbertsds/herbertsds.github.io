import { useMemo } from 'react';
import { Button, Spinner, ListGroup } from 'react-bootstrap';
import { useDataSelecionada } from '../context/DataSelecionadaContext';
import { useRefeicoesDoDia } from '../hooks/useRefeicoesDoDia';
import { usePlanoNutricional } from '../hooks/usePlanoNutricional';
import { useAlimentos } from '../hooks/useAlimentos';
import { RefeicaoCard } from '../components/RefeicaoCard';
import { ResumoNutricional } from '../components/ResumoNutricional';
import { SugestaoSubstituicao } from '../components/SugestaoSubstituicao';
import { calcularItem, calcularTotalItens, calcularTotalRefeicoes, arredondar } from '../domain/calculos';

function horarioEfetivo(refeicao) {
  return refeicao.horarioRegistrado ?? refeicao.horario;
}

export function RefeicoesDoDia() {
  const { data, mudarDia, irParaHoje, ehHoje, setData } = useDataSelecionada();
  const { alimentos, todos: todosOsAlimentos, carregando: carregandoAlimentos } = useAlimentos();
  const { plano, carregando: carregandoPlano } = usePlanoNutricional();
  const {
    diaRegistro,
    carregando: carregandoDia,
    editarRefeicao,
    adicionarItem,
    removerItem,
    substituirItensNaRefeicao,
  } = useRefeicoesDoDia(data);

  const alimentosPorId = useMemo(
    () => new Map(todosOsAlimentos.map((a) => [a.id, a])),
    [todosOsAlimentos],
  );

  // Variações (marcas) de cada alimento, agrupadas pelo id do alimento base — só entram no
  // seletor de variação ao adicionar algo aqui no dia, nunca no Plano.
  const variacoesPorBase = useMemo(() => {
    const mapa = new Map();
    for (const item of todosOsAlimentos) {
      if (item._variacao && !item.excluido) {
        const lista = mapa.get(item.alimentoBaseId) ?? [];
        lista.push(item);
        mapa.set(item.alimentoBaseId, lista);
      }
    }
    return mapa;
  }, [todosOsAlimentos]);

  // Toda refeição do plano aparece na tela, mesmo sem nada lançado nesse dia ainda — mas só
  // como exibição: nada é gravado até o usuário realmente mexer (adicionar um item, registrar
  // um horário...). As que já existem de verdade em `diaRegistro` entram como estão; as que
  // faltam viram um objeto "virtual" (id sintético `virtual:<tipo>`) só para renderizar. Ver
  // `useRefeicoesDoDia`: qualquer ação que mexa numa refeição virtual a cria de verdade na
  // hora (`criarSeNaoExistir`), e uma refeição real que fica sem itens e sem horário
  // registrado é removida do armazenamento automaticamente.
  const refeicoesParaExibir = useMemo(() => {
    const vistos = new Set();
    const tiposDoPlano = [];
    for (const r of plano.refeicoes) {
      if (!vistos.has(r.tipo)) {
        vistos.add(r.tipo);
        tiposDoPlano.push({ tipo: r.tipo, horario: r.horario });
      }
    }
    const porTipo = new Map(diaRegistro.refeicoes.map((r) => [r.tipo, r]));
    return tiposDoPlano.map((def) => {
      const existente = porTipo.get(def.tipo);
      if (existente) return existente;
      return {
        id: `virtual:${def.tipo}`,
        tipo: def.tipo,
        horario: def.horario,
        horarioRegistrado: null,
        itens: [],
      };
    });
  }, [plano, diaRegistro]);

  const metaDoTipo = (tipo) =>
    calcularTotalRefeicoes(
      plano.refeicoes.filter((r) => r.tipo === tipo),
      alimentosPorId,
    );
  const metaTotalDia = calcularTotalRefeicoes(plano.refeicoes, alimentosPorId);
  const consumidoTotalDia = calcularTotalRefeicoes(refeicoesParaExibir, alimentosPorId);

  if (carregandoAlimentos || carregandoPlano || carregandoDia) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <div className="pb-5">
      <div className="d-flex align-items-center justify-content-between mb-2 gap-2">
        <Button variant="outline-secondary" size="sm" onClick={() => mudarDia(-1)}>
          ‹
        </Button>
        <div className="text-center flex-grow-1">
          <input
            type="date"
            className="form-control form-control-sm"
            value={data}
            onChange={(e) => setData(e.target.value)}
          />
          {!ehHoje && (
            <Button variant="link" size="sm" className="p-0" onClick={irParaHoje}>
              voltar para hoje
            </Button>
          )}
        </div>
        <Button variant="outline-secondary" size="sm" onClick={() => mudarDia(1)}>
          ›
        </Button>
      </div>

      <div className="mb-3">
        <ResumoNutricional
          titulo="Total do dia"
          consumidoKcal={consumidoTotalDia.kcal}
          consumidoCho={consumidoTotalDia.cho}
          metaKcal={metaTotalDia.kcal}
          metaCho={metaTotalDia.cho}
          tamanho="grande"
        />
      </div>

      <h1 className="h5 mb-3">Refeições do dia</h1>

      {refeicoesParaExibir.length === 0 && (
        <p className="text-muted">Cadastre o plano nutricional para ver as refeições aqui.</p>
      )}

      {refeicoesParaExibir
        .slice()
        .sort((a, b) => horarioEfetivo(a).localeCompare(horarioEfetivo(b)))
        .map((refeicao) => {
          const criarSeNaoExistir = { tipo: refeicao.tipo, horario: refeicao.horario };
          const meta = metaDoTipo(refeicao.tipo);
          const consumido = calcularTotalItens(refeicao.itens, alimentosPorId);
          const itensPrevistos = plano.refeicoes
            .filter((r) => r.tipo === refeicao.tipo)
            .flatMap((r) => r.itens);
          const idsJaAdicionados = new Set(refeicao.itens.map((i) => i.alimentoId));
          const sugestoesRestantes = itensPrevistos.filter(
            (item) => !idsJaAdicionados.has(item.alimentoId),
          );

          return (
            <RefeicaoCard
              key={refeicao.id}
              refeicao={refeicao}
              alimentos={alimentos}
              alimentosPorId={alimentosPorId}
              onAdicionarItem={(alimentoId, quantidade) =>
                adicionarItem(refeicao.id, alimentoId, quantidade, 'extra', criarSeNaoExistir)
              }
              onRemoverItem={(itemId) => removerItem(refeicao.id, itemId)}
              onHorarioRegistradoChange={(horario) =>
                editarRefeicao(refeicao.id, { horarioRegistrado: horario }, criarSeNaoExistir)
              }
              permitirVariacoes
              variacoesPorBase={variacoesPorBase}
              resumo={
                <ResumoNutricional
                  titulo="Meta da refeição"
                  consumidoKcal={consumido.kcal}
                  consumidoCho={consumido.cho}
                  metaKcal={meta.kcal}
                  metaCho={meta.cho}
                />
              }
              rodape={
                sugestoesRestantes.length > 0 && (
                  <div className="mt-2">
                    <div className="small text-muted mb-1">Sugestões do plano:</div>
                    <ListGroup>
                      {sugestoesRestantes.map((item) => {
                        const alimento = alimentosPorId.get(item.alimentoId);
                        if (!alimento) return null;
                        const { kcal, cho } = calcularItem(item, alimentosPorId);
                        return (
                          <ListGroup.Item
                            key={item.id}
                            action
                            className="d-flex justify-content-between align-items-center gap-2"
                            onClick={() =>
                              adicionarItem(
                                refeicao.id,
                                item.alimentoId,
                                item.quantidadeG,
                                'sugestao-plano',
                                criarSeNaoExistir,
                              )
                            }
                          >
                            <span>{alimento.alimento}</span>
                            <small className="text-muted text-nowrap">
                              {item.quantidadeG}
                              {alimento.quantidade_indefinida ? 'x' : 'g'} · {Math.round(kcal)} kcal ·{' '}
                              {arredondar(cho)} g CHO
                            </small>
                          </ListGroup.Item>
                        );
                      })}
                    </ListGroup>
                  </div>
                )
              }
              extra={
                <SugestaoSubstituicao
                  refeicao={refeicao}
                  itensPrevistos={itensPrevistos}
                  alimentos={alimentos}
                  alimentosPorId={alimentosPorId}
                  onAplicar={(refeicaoId, idsParaRemover, novosItens) =>
                    substituirItensNaRefeicao(refeicaoId, idsParaRemover, novosItens, criarSeNaoExistir)
                  }
                />
              }
            />
          );
        })}
    </div>
  );
}
