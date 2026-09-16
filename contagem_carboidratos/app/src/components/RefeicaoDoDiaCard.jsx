import { useState } from 'react';
import { Form, ListGroup } from 'react-bootstrap';
import { RefeicaoCard } from './RefeicaoCard';
import { ResumoNutricional } from './ResumoNutricional';
import { AlimentosNoOrcamento } from './AlimentosNoOrcamento';
import { SugestaoSubstituicao } from './SugestaoSubstituicao';
import { calcularItem, calcularTotalItens, formatarNumero } from '../domain/calculos';

// Uma refeição do dia, renderizada dentro de `RefeicoesDoDia.jsx`. Existe como componente à
// parte (em vez de um bloco JSX montado dentro do `.map()` da página) porque os toggles
// Respeitar calorias/carboidratos agora são estado de verdade, próprio de cada refeição — e
// hooks não podem ser chamados dentro de um `.map()`.
export function RefeicaoDoDiaCard({
  refeicao,
  itensPrevistos,
  meta,
  alimentos,
  alimentosPorId,
  variacoesPorBase,
  onAdicionarItem,
  onRemoverItem,
  onEditarQuantidadeItem,
  onHorarioRegistradoChange,
  onSubstituir,
}) {
  const [respeitarCalorias, setRespeitarCalorias] = useState(true);
  const [respeitarCarboidratos, setRespeitarCarboidratos] = useState(true);

  const consumido = calcularTotalItens(refeicao.itens, alimentosPorId);
  const idsJaAdicionados = new Set(refeicao.itens.map((i) => i.alimentoId));
  const sugestoesRestantes = itensPrevistos.filter((item) => !idsJaAdicionados.has(item.alimentoId));

  return (
    <RefeicaoCard
      refeicao={refeicao}
      alimentos={alimentos}
      alimentosPorId={alimentosPorId}
      onAdicionarItem={onAdicionarItem}
      onRemoverItem={onRemoverItem}
      onEditarQuantidadeItem={onEditarQuantidadeItem}
      meta={meta}
      respeitarCalorias={respeitarCalorias}
      respeitarCarboidratos={respeitarCarboidratos}
      permitirVariacoes
      variacoesPorBase={variacoesPorBase}
      colapsavel
      ocultarBuscaLivre
      resumo={
        <ResumoNutricional
          titulo="Meta da refeição"
          consumidoKcal={consumido.kcal}
          consumidoCho={consumido.cho}
          metaKcal={meta.kcal}
          metaCho={meta.cho}
          contexto="nessa refeição"
          extra={
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
          }
        />
      }
      depoisDoResumo={
        <div className="d-flex gap-4 flex-wrap">
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
      }
      sugestoesDoPlano={
        sugestoesRestantes.length > 0 && (
          <div className="mb-3">
            <div className="small text-muted mb-1">Sugestões do plano:</div>
            <ListGroup className="subsecao">
              {sugestoesRestantes.map((item) => {
                const alimento = alimentosPorId.get(item.alimentoId);
                if (!alimento) return null;
                const { kcal, cho } = calcularItem(item, alimentosPorId);
                return (
                  <ListGroup.Item
                    key={item.id}
                    action
                    className="d-flex justify-content-between align-items-center gap-2"
                    onClick={() => onAdicionarItem(item.alimentoId, item.quantidadeG, 'sugestao-plano')}
                  >
                    <span className="fw-semibold">{alimento.alimento}</span>
                    <small className="text-muted text-nowrap">
                      {formatarNumero(item.quantidadeG, alimento.quantidade_indefinida ? 2 : 1)}
                      {alimento.quantidade_indefinida ? 'x' : 'g'} · {Math.round(kcal)} kcal ·{' '}
                      {formatarNumero(cho)} g CHO
                    </small>
                  </ListGroup.Item>
                );
              })}
            </ListGroup>
          </div>
        )
      }
      rodape={
        <AlimentosNoOrcamento
          alimentos={alimentos}
          orcamentoRestante={{
            kcal: Math.max(0, meta.kcal - consumido.kcal),
            cho: Math.max(0, meta.cho - consumido.cho),
          }}
          respeitarCalorias={respeitarCalorias}
          respeitarCarboidratos={respeitarCarboidratos}
          onAdicionar={(alimentoId, quantidade) => onAdicionarItem(alimentoId, quantidade, 'extra')}
        />
      }
      extra={
        <SugestaoSubstituicao
          refeicao={refeicao}
          itensPrevistos={itensPrevistos}
          alimentos={alimentos}
          alimentosPorId={alimentosPorId}
          meta={meta}
          onAplicar={(_refeicaoId, idsParaRemover, novosItens) => onSubstituir(idsParaRemover, novosItens)}
        />
      }
    />
  );
}
