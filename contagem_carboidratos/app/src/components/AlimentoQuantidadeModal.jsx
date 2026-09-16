import { useEffect, useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { QuantidadeDupla } from './QuantidadeDupla';
import { calcularItem, formatarNumero } from '../domain/calculos';

// Passo de quantidade depois de escolher um alimento (busca ou sugestão do plano). Quando
// `permitirVariacoes` está ligado (só nas Refeições do Dia — não faz sentido escolher marca
// no Plano) e o alimento tem variações cadastradas (ver AlimentoVariacoesModal), aparece um
// seletor: o padrão é o próprio alimento, mas dá pra trocar pra qualquer variação, que passa a
// valer pros cálculos e é o que efetivamente entra na refeição (onConfirmar recebe o id da
// variação escolhida, não o do alimento base).
export function AlimentoQuantidadeModal({
  alimento,
  variacoes = [],
  permitirVariacoes = false,
  aberto,
  onFechar,
  onConfirmar,
}) {
  const [variacaoId, setVariacaoId] = useState('');
  const [quantidade, setQuantidade] = useState(0);

  useEffect(() => {
    if (alimento) setVariacaoId('');
  }, [alimento]);

  const alimentoEfetivo = (variacaoId && variacoes.find((v) => v.id === variacaoId)) || alimento;

  useEffect(() => {
    if (alimentoEfetivo) {
      setQuantidade(alimentoEfetivo.quantidade_indefinida ? 1 : alimentoEfetivo.quantidade_g_ml || 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alimentoEfetivo?.id]);

  if (!alimento) return null;

  const alimentosPorId = new Map([[alimentoEfetivo.id, alimentoEfetivo]]);
  const { kcal, cho } = calcularItem(
    { alimentoId: alimentoEfetivo.id, quantidadeG: quantidade },
    alimentosPorId,
  );

  return (
    <Modal show={aberto} onHide={onFechar} centered>
      <Modal.Header closeButton>
        <Modal.Title>{alimento.alimento}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {permitirVariacoes && variacoes.length > 0 && (
          <Form.Group className="mb-3">
            <Form.Label>Variação</Form.Label>
            <Form.Select value={variacaoId} onChange={(e) => setVariacaoId(e.target.value)}>
              <option value="">Padrão</option>
              {variacoes.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.nomeVariacao}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        )}
        <p className="text-muted mb-3">Medida usual: {alimentoEfetivo.medida}</p>
        <QuantidadeDupla alimento={alimentoEfetivo} valor={quantidade} onChange={setQuantidade} autoFocus />
        {alimentoEfetivo.quantidade_indefinida && (
          <p className="text-muted small mt-2 mb-0">
            Esse alimento não tem peso informado — a quantidade é em porções (medida usual),
            não em gramas.
          </p>
        )}
        <div className="mt-3 d-flex gap-3">
          <span>
            <strong>{Math.round(kcal)}</strong> kcal
          </span>
          <span>
            <strong>{formatarNumero(cho)}</strong> g CHO
          </span>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onFechar}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          disabled={quantidade <= 0}
          onClick={() => {
            onConfirmar(alimentoEfetivo.id, quantidade);
            onFechar();
          }}
        >
          Adicionar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
