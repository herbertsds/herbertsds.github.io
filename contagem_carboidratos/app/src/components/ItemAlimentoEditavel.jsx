import { Badge, Button } from 'react-bootstrap';
import { QuantidadeDupla } from './QuantidadeDupla';
import { calcularItem, formatarNumero } from '../domain/calculos';
import { quantidadeMaximaParaItem, textoQuantidadeMaxima, fraseRespeitar } from '../domain/substituicao';

// Um alimento com quantidade editável dentro de uma "fila" — usado tanto pros itens já
// lançados numa refeição do dia quanto pra cesta da Sugestão de Substituição, porque a
// necessidade é idêntica: mostrar a dose original (medida usual do catálogo, fixa) e, com bem
// mais destaque, a dose na quantidade realmente ajustada pelos inputs — depois, separado por
// eixo (kcal/CHO), quanto sobra ou excede, e a frase de conclusão "Respeitando X, pode chegar
// até Y". `orcamento` é a meta da refeição (pro item já lançado) ou o orçamento da
// substituição (pra cesta); `usoOutros` é o quanto os OUTROS itens da mesma fila já usam
// desse orçamento — sem os dois, a seção de limite não aparece. Renderizado como cartão
// branco: o fundo por trás (`.subsecao`/`.lista-itens-refeicao`) é cinza, então vários
// cartões brancos em fila deixam claro que existe mais de um alimento ali.
export function ItemAlimentoEditavel({
  id,
  alimento,
  alimentosPorId,
  quantidade,
  onChangeQuantidade,
  onRemover,
  rotulo,
  orcamento,
  usoOutros,
  respeitarCalorias,
  respeitarCarboidratos,
  destacarNovo = false,
}) {
  if (!alimento) {
    return (
      <div id={id} className="item-alimento-editavel">
        <div className="d-flex justify-content-between align-items-center gap-2">
          <span className="text-muted">Alimento removido do catálogo</span>
          <Button size="sm" variant="link" className="text-danger p-0" onClick={onRemover}>
            remover
          </Button>
        </div>
      </div>
    );
  }

  // A dose "original" é literalmente o que já está gravado no catálogo pra medida usual
  // (calorias_kcal/carboidratos_g já são os valores PARA essa medida, não "por grama") — não
  // muda com o que o usuário ajustar nos inputs.
  const original = { kcal: alimento.calorias_kcal, cho: alimento.carboidratos_g };
  const atual = calcularItem({ alimentoId: alimento.id, quantidadeG: quantidade }, alimentosPorId);

  const frase = fraseRespeitar(respeitarCalorias, respeitarCarboidratos);

  let excedeKcalEm = 0;
  let excedeChoEm = 0;
  let restanteKcalDepois = null;
  let restanteChoDepois = null;
  let textoLimite = null;

  if (orcamento && frase) {
    const novoKcal = usoOutros.kcal + atual.kcal;
    const novoCho = usoOutros.cho + atual.cho;
    const excedeKcal = respeitarCalorias && novoKcal > orcamento.kcal;
    const excedeCho = respeitarCarboidratos && novoCho > orcamento.cho;
    excedeKcalEm = excedeKcal ? novoKcal - orcamento.kcal : 0;
    excedeChoEm = excedeCho ? novoCho - orcamento.cho : 0;
    restanteKcalDepois = respeitarCalorias && !excedeKcal ? orcamento.kcal - novoKcal : null;
    restanteChoDepois = respeitarCarboidratos && !excedeCho ? orcamento.cho - novoCho : null;

    const { quantidadeMaximaG, quantidadeMaximaMedidas } = quantidadeMaximaParaItem(alimento, usoOutros, orcamento, {
      calorias: respeitarCalorias,
      carboidratos: respeitarCarboidratos,
    });
    textoLimite = textoQuantidadeMaxima(alimento, quantidadeMaximaG, quantidadeMaximaMedidas);
  }

  return (
    <div id={id} className={`item-alimento-editavel${destacarNovo ? ' item-alimento-novo' : ''}`}>
      <div className="d-flex justify-content-between align-items-start gap-2 mb-1">
        <div className="item-alimento-nome">
          {alimento.alimento}
          {rotulo && (
            <Badge bg={rotulo.bg} text={rotulo.text} className="ms-2">
              {rotulo.texto}
            </Badge>
          )}
          {destacarNovo && (
            <Badge bg="primary" className="ms-2">
              novo
            </Badge>
          )}
        </div>
        <Button size="sm" variant="link" className="text-danger p-0" onClick={onRemover}>
          remover
        </Button>
      </div>

      <small className="text-muted d-block mb-2">
        Dose original ({alimento.medida}): {Math.round(original.kcal)} kcal · {formatarNumero(original.cho)} g CHO
      </small>

      <QuantidadeDupla alimento={alimento} valor={quantidade} onChange={onChangeQuantidade} />

      <div className="item-alimento-valor-atual mt-2">
        Nessa quantidade: {Math.round(atual.kcal)} kcal · {formatarNumero(atual.cho)} g CHO
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
    </div>
  );
}
