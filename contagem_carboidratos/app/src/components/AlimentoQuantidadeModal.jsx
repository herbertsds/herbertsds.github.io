import { useEffect, useState } from 'react';
import { Modal, Button, Form, Badge } from 'react-bootstrap';
import { QuantidadeDupla } from './QuantidadeDupla';
import { calcularItem, formatarNumero } from '../domain/calculos';
import { quantidadeMaximaParaItem, textoQuantidadeMaxima, fraseRespeitar } from '../domain/substituicao';

// Passo de quantidade depois de escolher um alimento (busca, sugestão do plano ou candidato
// por orçamento). Quando `permitirVariacoes` está ligado (só nas Refeições do Dia — não faz
// sentido escolher marca no Plano) e o alimento tem variações cadastradas (ver
// AlimentoVariacoesModal), aparece um seletor: o padrão é o próprio alimento, mas dá pra trocar
// pra qualquer variação, que passa a valer pros cálculos e é o que efetivamente entra na
// refeição (onConfirmar recebe o id da variação escolhida, não o do alimento base).
// `quantidadeInicial` (opcional) substitui a medida usual como valor de partida — usado quando
// quem abriu o modal já tinha uma quantidade específica em mente (a sugestão do plano, ou a
// quantidade testada de um candidato por orçamento); só vale pro alimento base — trocar pra uma
// variação volta a usar a medida usual dela, que é outra.
//
// `orcamento`/`usoOutros`/`respeitarCalorias`/`respeitarCarboidratos` (opcionais) trazem pra cá
// o mesmo feedback de "cabe ou excede" que já existia no card da lista de busca
// (`CandidatoOrcamentoItem`) e no item já lançado (`ItemAlimentoEditavel`) — sem eles, esse
// modal só mostrava o kcal/CHO absoluto da quantidade escolhida, sem dizer se isso ainda cabe
// no que resta da meta. Mesma lógica de cálculo dos outros dois (`quantidadeMaximaParaItem`),
// só que reagindo à quantidade sendo ajustada aqui, em vez de uma quantidade já fixada.
export function AlimentoQuantidadeModal({
  alimento,
  variacoes = [],
  permitirVariacoes = false,
  quantidadeInicial,
  orcamento,
  usoOutros,
  respeitarCalorias,
  respeitarCarboidratos,
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
      const usarInicial = quantidadeInicial != null && alimentoEfetivo.id === alimento?.id;
      setQuantidade(
        usarInicial ? quantidadeInicial : alimentoEfetivo.quantidade_indefinida ? 1 : alimentoEfetivo.quantidade_g_ml || 0,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alimentoEfetivo?.id]);

  if (!alimento) return null;

  const alimentosPorId = new Map([[alimentoEfetivo.id, alimentoEfetivo]]);
  const { kcal, cho } = calcularItem(
    { alimentoId: alimentoEfetivo.id, quantidadeG: quantidade },
    alimentosPorId,
  );

  const frase = fraseRespeitar(respeitarCalorias, respeitarCarboidratos);

  let excedeKcalEm = 0;
  let excedeChoEm = 0;
  let restanteKcalDepois = null;
  let restanteChoDepois = null;
  let textoLimite = null;

  if (orcamento && usoOutros && frase) {
    const novoKcal = usoOutros.kcal + kcal;
    const novoCho = usoOutros.cho + cho;
    const excedeKcal = respeitarCalorias && novoKcal > orcamento.kcal;
    const excedeCho = respeitarCarboidratos && novoCho > orcamento.cho;
    excedeKcalEm = excedeKcal ? novoKcal - orcamento.kcal : 0;
    excedeChoEm = excedeCho ? novoCho - orcamento.cho : 0;
    restanteKcalDepois = respeitarCalorias && !excedeKcal ? orcamento.kcal - novoKcal : null;
    restanteChoDepois = respeitarCarboidratos && !excedeCho ? orcamento.cho - novoCho : null;

    const { quantidadeMaximaG, quantidadeMaximaMedidas } = quantidadeMaximaParaItem(
      alimentoEfetivo,
      usoOutros,
      orcamento,
      { calorias: respeitarCalorias, carboidratos: respeitarCarboidratos },
    );
    textoLimite = textoQuantidadeMaxima(alimentoEfetivo, quantidadeMaximaG, quantidadeMaximaMedidas);
  }

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

        {frase && orcamento && (
          <div className="mt-2 pt-2 border-top">
            <div className="d-flex gap-1 flex-wrap mb-1">
              {excedeKcalEm > 0 && (
                <Badge bg="danger" className="text-nowrap">
                  +{Math.round(excedeKcalEm)} kcal
                </Badge>
              )}
              {restanteKcalDepois !== null && (
                <Badge bg="success" className="text-nowrap">
                  -{Math.round(restanteKcalDepois)} kcal
                </Badge>
              )}
              {excedeChoEm > 0 && (
                <Badge bg="danger" className="text-nowrap">
                  +{formatarNumero(excedeChoEm)} g CHO
                </Badge>
              )}
              {restanteChoDepois !== null && (
                <Badge bg="success" className="text-nowrap">
                  -{formatarNumero(restanteChoDepois)} g CHO
                </Badge>
              )}
            </div>
            {textoLimite && (
              <small className="text-muted d-block">
                Respeitando {frase}, pode chegar até {textoLimite}.
              </small>
            )}
          </div>
        )}
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
