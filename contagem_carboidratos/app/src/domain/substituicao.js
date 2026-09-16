// Lógica pura da "cesta" de substituição: orçamento (soma dos itens marcados para
// substituir), uso atual da cesta de candidatos já escolhidos, e classificação de cada
// alimento do catálogo — usando a medida usual do alimento como quantidade de teste,
// respeitando só os eixos (kcal/cho) marcados. Pra todo candidato (cabe ou não), calcula
// também a quantidade máxima (em gramas e em medidas usuais) que ainda caberia no orçamento —
// não só pra quem ultrapassa: mesmo um item que cabe na medida usual tem um teto de quanto
// mais daria pra comer sem estourar. As mesmas funções de "quantidade máxima" também servem
// pra dizer, ao editar um item já lançado numa refeição, até quanto ELE pode ir no total (ver
// `RefeicaoCard.jsx`) — por isso ficam exportadas à parte de `classificarCandidato`.

import { calcularTotalItens, formatarNumero } from './calculos';

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

// `null` quando não há um teto real: nenhum eixo respeitado, ou o(s) eixo(s) respeitado(s)
// tem taxa zero pra esse alimento (ex: um alimento com 0 kcal/g não tem limite por caloria).
// `usoAtual` é o que já foi gasto do orçamento por OUTRAS coisas — pra classificar um
// candidato novo, é a cesta/o já consumido; pra saber até quanto um item já lançado pode ir
// no total, é a soma dos OUTROS itens da mesma refeição (ver `quantidadeMaximaParaItem`).
export function calcularQuantidadeMaxima(alimento, usoAtual, orcamento, respeitar) {
  if (!respeitar.calorias && !respeitar.carboidratos) return null;

  const taxa = taxaPorUnidade(alimento);
  const restanteKcal = orcamento.kcal - usoAtual.kcal;
  const restanteCho = orcamento.cho - usoAtual.cho;

  let max = Infinity;
  if (respeitar.calorias && taxa.kcal > 0) max = Math.min(max, restanteKcal / taxa.kcal);
  if (respeitar.carboidratos && taxa.cho > 0) max = Math.min(max, restanteCho / taxa.cho);
  if (!Number.isFinite(max)) return null;

  return Math.max(0, max);
}

// Converte o número "cru" de `calcularQuantidadeMaxima` (unidade = grama, ou 1 porção pros de
// quantidade_indefinida) em gramas + medidas usuais, prontos pra exibir.
export function converterQuantidadeMaxima(alimento, max) {
  if (max === null) return { quantidadeMaximaG: null, quantidadeMaximaMedidas: null };
  return {
    quantidadeMaximaG: alimento.quantidade_indefinida ? null : max,
    quantidadeMaximaMedidas: alimento.quantidade_indefinida
      ? max
      : alimento.quantidade_g_ml
        ? max / alimento.quantidade_g_ml
        : 0,
  };
}

// Texto pronto ("50 g (0,5x colher de sopa)" ou, pros de quantidade_indefinida, só
// "0,5x colher de sopa") — `null` quando não há teto real (ver `calcularQuantidadeMaxima`).
export function textoQuantidadeMaxima(alimento, quantidadeMaximaG, quantidadeMaximaMedidas) {
  if (quantidadeMaximaMedidas === null) return null;
  return alimento.quantidade_indefinida
    ? `${formatarNumero(quantidadeMaximaMedidas, 2)}x ${alimento.medida}`
    : `${formatarNumero(quantidadeMaximaG, 1)} g (${formatarNumero(quantidadeMaximaMedidas, 2)}x ${alimento.medida})`;
}

// Até quanto um item JÁ lançado numa refeição pode ir no total (não "quanto mais", o total),
// respeitando a meta da refeição inteira e o que os OUTROS itens dela já usam.
export function quantidadeMaximaParaItem(alimento, usoOutrosItens, metaRefeicao, respeitar) {
  const max = calcularQuantidadeMaxima(alimento, usoOutrosItens, metaRefeicao, respeitar);
  return converterQuantidadeMaxima(alimento, max);
}

// "calorias e carboidratos" / "calorias" / "carboidratos" / `null` (nenhum eixo respeitado) —
// usado nas frases "Respeitando X, pode chegar até Y".
export function fraseRespeitar(respeitarCalorias, respeitarCarboidratos) {
  if (respeitarCalorias && respeitarCarboidratos) return 'calorias e carboidratos';
  if (respeitarCalorias) return 'calorias';
  if (respeitarCarboidratos) return 'carboidratos';
  return null;
}

// Filtro (todos / só os que cabem / só os que ultrapassam) + ordenação (por kcal ou CHO
// acrescentados, crescente ou decrescente) sobre uma lista já classificada por
// `classificarCandidato` — usado tanto na Sugestão de Substituição quanto na lista de "o que
// cabe (e o que ultrapassa)" ao adicionar um alimento direto numa refeição.
export function filtrarEOrdenarCandidatos(candidatos, { filtro = 'todos', ordenarPor = null, direcao = 'asc' } = {}) {
  let lista = candidatos;
  if (filtro === 'cabem') lista = lista.filter((c) => !c.excede);
  else if (filtro === 'ultrapassam') lista = lista.filter((c) => c.excede);

  if (ordenarPor) {
    const chave = ordenarPor === 'kcal' ? 'acrescimoKcal' : 'acrescimoCho';
    lista = [...lista].sort((a, b) => (direcao === 'asc' ? a[chave] - b[chave] : b[chave] - a[chave]));
  }

  return lista;
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

  const max = calcularQuantidadeMaxima(alimento, usoAtual, orcamento, respeitar);
  const { quantidadeMaximaG, quantidadeMaximaMedidas } = converterQuantidadeMaxima(alimento, max);

  return {
    alimento,
    quantidadeTeste,
    acrescimoKcal: acrescimo.kcal,
    acrescimoCho: acrescimo.cho,
    excede,
    // Um eixo por vez, pra render poder mostrar "excede calorias" e "excede carboidratos"
    // como marcadores separados (em vez de um badge só combinando os dois).
    excedeKcalEm: excedeKcal ? novoKcal - orcamento.kcal : 0,
    excedeChoEm: excedeCho ? novoCho - orcamento.cho : 0,
    // Espelho do excede: quanto sobraria de cada eixo respeitado, só quando esse eixo NÃO
    // estoura (senão é o excedeXEm que conta a história). `null` = eixo não respeitado.
    restanteKcalDepois: respeitar.calorias && !excedeKcal ? orcamento.kcal - novoKcal : null,
    restanteChoDepois: respeitar.carboidratos && !excedeCho ? orcamento.cho - novoCho : null,
    quantidadeMaximaG,
    quantidadeMaximaMedidas,
  };
}
