import { useState } from 'react';
import { Card, ListGroup, Button, Badge } from 'react-bootstrap';
import { AlimentoBuscaInput } from './AlimentoBuscaInput';
import { AlimentoQuantidadeModal } from './AlimentoQuantidadeModal';
import { calcularItem, calcularTotalItens, arredondar } from '../domain/calculos';

const ROTULOS_ORIGEM = {
  'sugestao-plano': { texto: 'do plano', bg: 'info' },
  substituicao: { texto: 'substituição', bg: 'warning', text: 'dark' },
};

// Card genérico de refeição: cabeçalho (tipo/horário + editar/excluir), o resumo de
// calorias/carboidratos logo em seguida (a informação principal — sempre a primeira coisa do
// card, antes até da lista de itens), depois a lista de itens, e busca para adicionar um novo
// alimento. Usado tanto no Plano Nutricional quanto nas Refeições do Dia — o que muda entre
// eles entra via `resumo` (o medidor de meta/consumido, só no Dia), `rodape` (sugestões do
// plano) e `extra` (sugestão de substituição), passados pela página que o usa.
// `onEditar`/`onExcluir` são opcionais (só o Plano os usa — no Dia a refeição vem sempre do
// plano, não tem o que editar/excluir). `onHorarioRegistradoChange` (só o Dia) troca o texto
// fixo do horário por um campo editável: o horário que a refeição foi de fato feita, separado
// do horário programado no plano.
export function RefeicaoCard({
  refeicao,
  alimentos,
  alimentosPorId,
  onAdicionarItem,
  onRemoverItem,
  onEditar,
  onExcluir,
  onHorarioRegistradoChange,
  totalLabel,
  resumo,
  rodape,
  extra,
  permitirVariacoes = false,
  variacoesPorBase,
}) {
  const [alimentoEmEscolha, setAlimentoEmEscolha] = useState(null);
  const total = calcularTotalItens(refeicao.itens, alimentosPorId);

  return (
    <Card className="mb-3 shadow-sm">
      <Card.Header className="d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <strong>{refeicao.tipo}</strong>
          {onHorarioRegistradoChange ? (
            <div className="d-flex align-items-center gap-1">
              <input
                type="time"
                className="form-control form-control-sm"
                style={{ width: 110 }}
                value={refeicao.horarioRegistrado ?? refeicao.horario}
                onChange={(e) => onHorarioRegistradoChange(e.target.value)}
              />
              <small className="text-muted">registrado</small>
            </div>
          ) : (
            <span className="text-muted">{refeicao.horario}</span>
          )}
        </div>
        {(onEditar || onExcluir) && (
          <div>
            {onEditar && (
              <Button size="sm" variant="outline-secondary" className="me-1" onClick={onEditar}>
                Editar
              </Button>
            )}
            {onExcluir && (
              <Button size="sm" variant="outline-danger" onClick={onExcluir}>
                Excluir
              </Button>
            )}
          </div>
        )}
      </Card.Header>

      {resumo && <Card.Body className="pb-2">{resumo}</Card.Body>}

      {refeicao.itens.length > 0 && (
        <ListGroup variant="flush">
          {refeicao.itens.map((item) => {
            const alimento = alimentosPorId.get(item.alimentoId);
            const { kcal, cho } = calcularItem(item, alimentosPorId);
            const unidade = alimento?.quantidade_indefinida
              ? `${item.quantidadeG}x ${alimento.medida}`
              : `${item.quantidadeG} g`;
            const rotulo = ROTULOS_ORIGEM[item.origem];
            return (
              <ListGroup.Item
                key={item.id}
                className="d-flex justify-content-between align-items-start gap-2"
              >
                <div>
                  <div>
                    {alimento ? alimento.alimento : 'Alimento removido do catálogo'}
                    {rotulo && (
                      <Badge bg={rotulo.bg} text={rotulo.text} className="ms-2">
                        {rotulo.texto}
                      </Badge>
                    )}
                  </div>
                  <small className="text-muted">
                    {unidade} · {Math.round(kcal)} kcal · {arredondar(cho)} g CHO
                  </small>
                </div>
                <Button
                  size="sm"
                  variant="link"
                  className="text-danger p-0"
                  onClick={() => onRemoverItem(item.id)}
                >
                  remover
                </Button>
              </ListGroup.Item>
            );
          })}
        </ListGroup>
      )}

      <Card.Body>
        <AlimentoBuscaInput alimentos={alimentos} onSelecionar={setAlimentoEmEscolha} />
        {totalLabel && (
          <div className="mt-2 d-flex justify-content-between">
            <span>{totalLabel}</span>
            <strong>
              {Math.round(total.kcal)} kcal · {arredondar(total.cho)} g CHO
            </strong>
          </div>
        )}
        {rodape}
        {extra}
      </Card.Body>

      <AlimentoQuantidadeModal
        alimento={alimentoEmEscolha}
        variacoes={variacoesPorBase?.get(alimentoEmEscolha?.id) ?? []}
        permitirVariacoes={permitirVariacoes}
        aberto={!!alimentoEmEscolha}
        onFechar={() => setAlimentoEmEscolha(null)}
        onConfirmar={(alimentoId, quantidade) => onAdicionarItem(alimentoId, quantidade)}
      />
    </Card>
  );
}
