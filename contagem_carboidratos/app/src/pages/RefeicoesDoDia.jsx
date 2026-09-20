import { useEffect, useMemo, useState } from 'react';
import { Button, Spinner } from 'react-bootstrap';
import { useDataSelecionada } from '../context/DataSelecionadaContext';
import { useRefeicoesDoDia } from '../hooks/useRefeicoesDoDia';
import { usePlanoNutricional } from '../hooks/usePlanoNutricional';
import { useAlimentos } from '../hooks/useAlimentos';
import { RefeicaoDoDiaCard } from '../components/RefeicaoDoDiaCard';
import { ResumoNutricional } from '../components/ResumoNutricional';
import { calcularTotalRefeicoes } from '../domain/calculos';

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
    editarQuantidadeItem,
    substituirItensNaRefeicao,
  } = useRefeicoesDoDia(data);

  const alimentosPorId = useMemo(
    () => new Map(todosOsAlimentos.map((a) => [a.id, a])),
    [todosOsAlimentos],
  );

  // Id do último item adicionado (em qualquer refeição) — pra destacar o cartão e rolar até
  // ele. Um só por vez: adicionar outro substitui; some sozinho depois de 1 minuto.
  const [recemAdicionadoId, setRecemAdicionadoId] = useState(null);
  useEffect(() => {
    if (!recemAdicionadoId) return;
    const frame = requestAnimationFrame(() => {
      document.getElementById(`item-${recemAdicionadoId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    const timer = setTimeout(() => setRecemAdicionadoId(null), 60000);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, [recemAdicionadoId]);

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
      // Categoria nova no plano só passa a aparecer a partir do dia em que foi cadastrada —
      // sem `criadoEmData` (refeições antigas, de antes desse campo existir) continua
      // aparecendo em qualquer dia, como sempre apareceu.
      if (r.criadoEmData && r.criadoEmData > data) continue;
      if (!vistos.has(r.tipo)) {
        vistos.add(r.tipo);
        tiposDoPlano.push({ tipo: r.tipo, horario: r.horario, criadoEm: r.criadoEm ?? 0 });
      }
    }
    const porTipo = new Map(diaRegistro.refeicoes.map((r) => [r.tipo, r]));
    return tiposDoPlano.map((def) => {
      const existente = porTipo.get(def.tipo);
      if (existente) return { ...existente, criadoEm: def.criadoEm };
      return {
        id: `virtual:${def.tipo}`,
        tipo: def.tipo,
        horario: def.horario,
        horarioRegistrado: null,
        itens: [],
        criadoEm: def.criadoEm,
      };
    });
  }, [plano, diaRegistro, data]);

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
      <div className="d-flex align-items-start justify-content-between mb-2 gap-2">
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
          {/* Sempre renderizado (só fica invisível em vez de sumir) — o link "voltar para
              hoje" não deve empurrar o input pra baixo visualmente nem mudar onde ‹ › ficam.
              Com align-items-start (em vez de center) no container, ‹ › ficam alinhados com o
              topo dessa coluna — ou seja, com o input — esteja o link visível ou não. */}
          <Button
            variant="link"
            size="sm"
            className={`p-0 ${ehHoje ? 'invisible' : ''}`}
            disabled={ehHoje}
            tabIndex={ehHoje ? -1 : 0}
            aria-hidden={ehHoje}
            onClick={irParaHoje}
          >
            voltar para hoje
          </Button>
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
          contexto="no dia"
        />
      </div>

      <h1 className="h5 mb-3">Refeições do dia</h1>

      {refeicoesParaExibir.length === 0 && (
        <p className="text-muted">Cadastre o plano nutricional para ver as refeições aqui.</p>
      )}

      {refeicoesParaExibir
        .slice()
        .sort(
          (a, b) =>
            horarioEfetivo(a).localeCompare(horarioEfetivo(b)) || (a.criadoEm ?? 0) - (b.criadoEm ?? 0),
        )
        .map((refeicao) => {
          const criarSeNaoExistir = { tipo: refeicao.tipo, horario: refeicao.horario };
          const meta = metaDoTipo(refeicao.tipo);
          const itensPrevistos = plano.refeicoes
            .filter((r) => r.tipo === refeicao.tipo)
            .flatMap((r) => r.itens);

          return (
            <RefeicaoDoDiaCard
              // Por tipo, não por id: uma refeição virtual materializa com um id novo (gerado
              // na hora) assim que o primeiro item é lançado — usar `refeicao.id` como key
              // faria o React remontar o card do zero nesse momento (perdendo o estado local:
              // colapso, toggles Respeitar, filtro/ordenação da lista). `tipo` é estável e
              // único entre as refeições exibidas (`tiposDoPlano` já é deduplicado por tipo).
              key={refeicao.tipo}
              refeicao={refeicao}
              itensPrevistos={itensPrevistos}
              meta={meta}
              alimentos={alimentos}
              alimentosPorId={alimentosPorId}
              variacoesPorBase={variacoesPorBase}
              recemAdicionadoId={recemAdicionadoId}
              onAdicionarItem={(alimentoId, quantidade, origem = 'extra') => {
                const novoId = adicionarItem(refeicao.id, alimentoId, quantidade, origem, criarSeNaoExistir);
                setRecemAdicionadoId(novoId);
              }}
              onRemoverItem={(itemId) => removerItem(refeicao.id, itemId)}
              onEditarQuantidadeItem={(itemId, quantidadeG) =>
                editarQuantidadeItem(refeicao.id, itemId, quantidadeG)
              }
              onHorarioRegistradoChange={(horario) =>
                editarRefeicao(refeicao.id, { horarioRegistrado: horario }, criarSeNaoExistir)
              }
              onSubstituir={(idsParaRemover, novosItens) =>
                substituirItensNaRefeicao(refeicao.id, idsParaRemover, novosItens, criarSeNaoExistir)
              }
            />
          );
        })}
    </div>
  );
}
