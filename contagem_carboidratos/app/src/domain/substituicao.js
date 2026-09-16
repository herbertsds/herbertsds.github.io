// Lógica pura da "cesta" de substituição: orçamento (soma dos itens marcados para
// substituir), uso atual da cesta de candidatos já escolhidos, e classificação de cada
// alimento do catálogo como "cabe" ou "ultrapassa" o orçamento — usando a medida usual do
// alimento como quantidade de teste, respeitando só os eixos (kcal/cho) marcados. Para quem
// ultrapassa, também calcula a quantidade máxima (em gramas e em medidas usuais) que ainda
// caberia no orçamento.

import { calcularTotalItens } from './calculos';

export function calcularOrcamento(itensOriginais, alimentosPorId) {
  return calcularTotalItens(itensOriginais, alimentosPorId);
}

export function calcularUsoCesta(cesta, alimentosPorId) {
  return calcularTotalItens(cesta, alimentosPorId);
}

function taxaPorUnidade(alimento) {
  // "unidade" é grama para alimentos normais, e 1 porção (medida usual) para os de
  // quantidade_indefinida — o mesmo significado que quantidadeG já tem no resto do app.
  if (alimento.quantidade_indefinida) {
    return { kcal: alimento.calorias_kcal, cho: alimento.carboidratos_g };
  }
  return {
    kcal: alimento.calorias_kcal / alimento.quantidade_g_ml,
    cho: alimento.carboidratos_g / alimento.quantidade_g_ml,
  };
}

function calcularQuantidadeMaxima(alimento, usoAtual, orcamento, respeitar) {
  const taxa = taxaPorUnidade(alimento);
  const restanteKcal = orcamento.kcal - usoAtual.kcal;
  const restanteCho = orcamento.cho - usoAtual.cho;

  let max = Infinity;
  if (respeitar.calorias && taxa.kcal > 0) max = Math.min(max, restanteKcal / taxa.kcal);
  if (respeitar.carboidratos && taxa.cho > 0) max = Math.min(max, restanteCho / taxa.cho);
  if (!Number.isFinite(max)) max = 0;

  return Math.max(0, max);
}

export function classificarCandidato(alimento, usoAtual, orcamento, respeitar) {
  const quantidadeTeste = alimento.quantidade_indefinida ? 1 : alimento.quantidade_g_ml;
  const alimentosPorId = new Map([[alimento.id, alimento]]);
  const acrescimo = calcularTotalItens(
    [{ alimentoId: alimento.id, quantidadeG: quantidadeTeste }],
    alimentosPorId,
  );

  const novoKcal = usoAtual.kcal + acrescimo.kcal;
  const novoCho = usoAtual.cho + acrescimo.cho;

  const excedeKcal = respeitar.calorias && novoKcal > orcamento.kcal;
  const excedeCho = respeitar.carboidratos && novoCho > orcamento.cho;
  const excede = excedeKcal || excedeCho;

  let quantidadeMaximaG = null;
  let quantidadeMaximaMedidas = null;
  if (excede) {
    const max = calcularQuantidadeMaxima(alimento, usoAtual, orcamento, respeitar);
    quantidadeMaximaG = alimento.quantidade_indefinida ? null : max;
    quantidadeMaximaMedidas = alimento.quantidade_indefinida
      ? max
      : alimento.quantidade_g_ml
        ? max / alimento.quantidade_g_ml
        : 0;
  }

  return {
    alimento,
    quantidadeTeste,
    acrescimoKcal: acrescimo.kcal,
    acrescimoCho: acrescimo.cho,
    excede,
    excedeKcalEm: excedeKcal ? novoKcal - orcamento.kcal : 0,
    excedeChoEm: excedeCho ? novoCho - orcamento.cho : 0,
    quantidadeMaximaG,
    quantidadeMaximaMedidas,
  };
}
