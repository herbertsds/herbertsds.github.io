import { useEffect, useMemo, useState } from 'react';
import { Button, Spinner } from 'react-bootstrap';
import { usePlanoNutricional } from '../hooks/usePlanoNutricional';
import { useAlimentos } from '../hooks/useAlimentos';
import { RefeicaoCard } from '../components/RefeicaoCard';
import { RefeicaoFormModal } from '../components/RefeicaoFormModal';
import { BuscaAlimentosPlano } from '../components/BuscaAlimentosPlano';
import { ResumoMetaRefeicao } from '../components/ResumoMetaRefeicao';
import { ImprimirPlanoModal } from '../components/ImprimirPlanoModal';
import { calcularTotalItens, calcularTotalRefeicoes } from '../domain/calculos';

export function PlanoNutricional() {
  const { alimentos, todos: todosOsAlimentos, carregando: carregandoAlimentos } = useAlimentos();
  const {
    plano,
    carregando: carregandoPlano,
    adicionarRefeicao,
    editarRefeicao,
    excluirRefeicao,
    adicionarItem,
    removerItem,
    editarQuantidadeItem,
  } = usePlanoNutricional();

  const [modalAberto, setModalAberto] = useState(false);
  const [refeicaoEditando, setRefeicaoEditando] = useState(null);

  const [modalImpressaoAberto, setModalImpressaoAberto] = useState(false);
  const [nomeImpressao, setNomeImpressao] = useState('');
  const [mostrarKcalImpressao, setMostrarKcalImpressao] = useState(true);
  const [mostrarChoImpressao, setMostrarChoImpressao] = useState(true);

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

  const alimentosPorId = useMemo(
    () => new Map(todosOsAlimentos.map((a) => [a.id, a])),
    [todosOsAlimentos],
  );
  const tiposExistentes = plano.refeicoes.map((r) => r.tipo);
  const totalPlano = calcularTotalRefeicoes(plano.refeicoes, alimentosPorId);
  // Por horário; empatou (dois cadastrados no mesmo horário), desempata por ordem de criação.
  const refeicoesOrdenadas = plano.refeicoes
    .slice()
    .sort((a, b) => a.horario.localeCompare(b.horario) || (a.criadoEm ?? 0) - (b.criadoEm ?? 0));

  if (carregandoAlimentos || carregandoPlano) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  if (plano.refeicoes.length === 0) {
    return (
      <div className="text-center py-5">
        <p>Você ainda não cadastrou o plano nutricional receitado pela nutricionista.</p>
        <Button
          onClick={() => {
            setRefeicaoEditando(null);
            setModalAberto(true);
          }}
        >
          Adicionar refeição
        </Button>
        <RefeicaoFormModal
          aberto={modalAberto}
          refeicaoInicial={null}
          tiposExistentes={tiposExistentes}
          onFechar={() => setModalAberto(false)}
          onSalvar={({ tipo, horario }) => adicionarRefeicao(tipo, horario)}
        />
      </div>
    );
  }

  return (
    <>
      <div className="pb-5 no-imprimir">
        <div className="d-flex justify-content-between align-items-center mb-3 gap-2">
          <h1 className="h5 mb-0">Plano Nutricional</h1>
          <div className="d-flex gap-2">
            <Button size="sm" variant="outline-secondary" onClick={() => setModalImpressaoAberto(true)}>
              Imprimir
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setRefeicaoEditando(null);
                setModalAberto(true);
              }}
            >
              + Refeição
            </Button>
          </div>
        </div>

        <div className="mb-3">
          <ResumoMetaRefeicao titulo="Total do plano" metaKcal={totalPlano.kcal} metaCho={totalPlano.cho} tamanho="grande" />
        </div>

        {refeicoesOrdenadas.map((refeicao) => {
          const adicionarComDestaque = (alimentoId, quantidade) => {
            const novoId = adicionarItem(refeicao.id, alimentoId, quantidade);
            setRecemAdicionadoId(novoId);
          };
          const totalRefeicao = calcularTotalItens(refeicao.itens, alimentosPorId);
          return (
            <RefeicaoCard
              key={refeicao.id}
              refeicao={refeicao}
              alimentos={alimentos}
              alimentosPorId={alimentosPorId}
              colapsavel
              ocultarBuscaLivre
              recemAdicionadoId={recemAdicionadoId}
              onAdicionarItem={adicionarComDestaque}
              onRemoverItem={(itemId) => removerItem(refeicao.id, itemId)}
              onEditarQuantidadeItem={(itemId, quantidadeG) => editarQuantidadeItem(refeicao.id, itemId, quantidadeG)}
              rodape={<BuscaAlimentosPlano alimentos={alimentos} onAdicionar={adicionarComDestaque} />}
              onEditar={() => {
                setRefeicaoEditando(refeicao);
                setModalAberto(true);
              }}
              onExcluir={() => excluirRefeicao(refeicao.id)}
              resumo={
                <ResumoMetaRefeicao
                  titulo="Meta da refeição"
                  metaKcal={totalRefeicao.kcal}
                  metaCho={totalRefeicao.cho}
                  extra={<span className="text-muted">{refeicao.horario}</span>}
                />
              }
            />
          );
        })}

        <RefeicaoFormModal
          aberto={modalAberto}
          refeicaoInicial={refeicaoEditando}
          tiposExistentes={tiposExistentes}
          onFechar={() => setModalAberto(false)}
          onSalvar={({ tipo, horario }) => {
            if (refeicaoEditando) {
              editarRefeicao(refeicaoEditando.id, { tipo, horario });
            } else {
              adicionarRefeicao(tipo, horario);
            }
          }}
        />

        <ImprimirPlanoModal
          aberto={modalImpressaoAberto}
          nome={nomeImpressao}
          onNomeChange={setNomeImpressao}
          mostrarKcal={mostrarKcalImpressao}
          mostrarCho={mostrarChoImpressao}
          onMostrarKcalChange={setMostrarKcalImpressao}
          onMostrarChoChange={setMostrarChoImpressao}
          onFechar={() => setModalImpressaoAberto(false)}
          onImprimir={() => {
            window.print();
            setModalImpressaoAberto(false);
          }}
        />
      </div>

      {/* Só visível no diálogo de impressão (ver `.somente-impressao` no index.css) — versão
          enxuta do plano: por refeição, só tipo + horário + os números grandes de meta (sem
          "consumido", que não existe aqui), mais o total do dia. Nome e quais eixos aparecer
          vêm do `ImprimirPlanoModal`, aberto pelo botão "Imprimir". */}
      <div className="somente-impressao">
        <h1 className="h5 mb-3">Plano Nutricional{nomeImpressao.trim() && ` - ${nomeImpressao.trim()}`}</h1>
        {refeicoesOrdenadas.map((refeicao) => {
          const totalRefeicao = calcularTotalItens(refeicao.itens, alimentosPorId);
          return (
            <ResumoMetaRefeicao
              key={refeicao.id}
              titulo={refeicao.tipo}
              metaKcal={totalRefeicao.kcal}
              metaCho={totalRefeicao.cho}
              mostrarKcal={mostrarKcalImpressao}
              mostrarCho={mostrarChoImpressao}
              extra={<span className="text-muted">{refeicao.horario}</span>}
            />
          );
        })}
        <ResumoMetaRefeicao
          titulo="Total do dia"
          metaKcal={totalPlano.kcal}
          metaCho={totalPlano.cho}
          mostrarKcal={mostrarKcalImpressao}
          mostrarCho={mostrarChoImpressao}
          tamanho="grande"
        />
      </div>
    </>
  );
}
