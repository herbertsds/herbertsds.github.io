import { useMemo, useState } from 'react';
import { Accordion, Button, Alert, Spinner } from 'react-bootstrap';
import { usePlanoNutricional } from '../hooks/usePlanoNutricional';
import { useAlimentos } from '../hooks/useAlimentos';
import { RefeicaoCard } from '../components/RefeicaoCard';
import { RefeicaoFormModal } from '../components/RefeicaoFormModal';
import { calcularTotalRefeicoes, arredondar } from '../domain/calculos';

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
  } = usePlanoNutricional();

  const [modalAberto, setModalAberto] = useState(false);
  const [refeicaoEditando, setRefeicaoEditando] = useState(null);

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

      <Accordion>
        {plano.refeicoes
          .slice()
          .sort((a, b) => a.horario.localeCompare(b.horario))
          .map((refeicao, indice) => (
            <Accordion.Item eventKey={String(indice)} key={refeicao.id} className="mb-2 border rounded">
              <Accordion.Header>
                <span className="me-2">{refeicao.tipo}</span>
                <span className="text-muted small">{refeicao.horario}</span>
              </Accordion.Header>
              <Accordion.Body>
                <RefeicaoCard
                  refeicao={refeicao}
                  alimentos={alimentos}
                  alimentosPorId={alimentosPorId}
                  onAdicionarItem={(alimentoId, quantidade) =>
                    adicionarItem(refeicao.id, alimentoId, quantidade)
                  }
                  onRemoverItem={(itemId) => removerItem(refeicao.id, itemId)}
                  onEditar={() => {
                    setRefeicaoEditando(refeicao);
                    setModalAberto(true);
                  }}
                  onExcluir={() => excluirRefeicao(refeicao.id)}
                  totalLabel="Total da refeição (meta)"
                />
              </Accordion.Body>
            </Accordion.Item>
          ))}
      </Accordion>

      <Alert variant="light" className="border mt-3 mb-0 d-flex justify-content-between">
        <span>Total do plano</span>
        <strong>
          {Math.round(totalPlano.kcal)} kcal · {arredondar(totalPlano.cho)} g CHO
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
