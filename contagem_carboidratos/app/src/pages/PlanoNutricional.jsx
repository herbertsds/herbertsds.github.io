import { useEffect, useMemo, useState } from 'react';
import { Button, Alert, Spinner } from 'react-bootstrap';
import { usePlanoNutricional } from '../hooks/usePlanoNutricional';
import { useAlimentos } from '../hooks/useAlimentos';
import { RefeicaoCard } from '../components/RefeicaoCard';
import { RefeicaoFormModal } from '../components/RefeicaoFormModal';
import { BuscaAlimentosPlano } from '../components/BuscaAlimentosPlano';
import { calcularTotalRefeicoes, formatarNumero } from '../domain/calculos';

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
    <div className="pb-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h5 mb-0">Plano Nutricional</h1>
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

      {plano.refeicoes
        .slice()
        .sort((a, b) => a.horario.localeCompare(b.horario))
        .map((refeicao) => {
          const adicionarComDestaque = (alimentoId, quantidade) => {
            const novoId = adicionarItem(refeicao.id, alimentoId, quantidade);
            setRecemAdicionadoId(novoId);
          };
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
            totalLabel="Total da refeição (meta)"
          />
          );
        })}

      <Alert variant="light" className="border mt-3 mb-0 d-flex justify-content-between">
        <span>Total do plano</span>
        <strong>
          {Math.round(totalPlano.kcal)} kcal · {formatarNumero(totalPlano.cho)} g CHO
        </strong>
      </Alert>

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
    </div>
  );
}
