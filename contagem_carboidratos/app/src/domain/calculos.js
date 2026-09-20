// Cálculo nutricional linear: kcal/CHO do JSON são para a "medida usual" (quantidade_g_ml).
// Para alimentos com quantidade_g_ml=0 (quantidade_indefinida=true, ~3.5% do catálogo — dados
// de fast-food sem peso informado no manual original), não há taxa por grama: o item é
// adicionado em múltiplos inteiros da medida usual, e quantidadeG passa a significar
// "número de porções" em vez de gramas.

export function valorPorGrama(alimento) {
  if (!alimento || alimento.quantidade_indefinida || !alimento.quantidade_g_ml) {
    return null;
  }
  return {
    kcalPorGrama: alimento.calorias_kcal / alimento.quantidade_g_ml,
    choPorGrama: alimento.carboidratos_g / alimento.quantidade_g_ml,
  };
}

export function calcularItem(item, alimentosPorId) {
  const alimento = alimentosPorId.get(item.alimentoId);
  if (!alimento) return { kcal: 0, cho: 0 };

  if (alimento.quantidade_indefinida) {
    return {
      kcal: alimento.calorias_kcal * item.quantidadeG,
      cho: alimento.carboidratos_g * item.quantidadeG,
    };
  }

  const taxa = valorPorGrama(alimento);
  return {
    kcal: taxa.kcalPorGrama * item.quantidadeG,
    cho: taxa.choPorGrama * item.quantidadeG,
  };
}

export function calcularTotalItens(itens, alimentosPorId) {
  return itens.reduce(
    (total, item) => {
      const { kcal, cho } = calcularItem(item, alimentosPorId);
      return { kcal: total.kcal + kcal, cho: total.cho + cho };
    },
    { kcal: 0, cho: 0 },
  );
}

export function calcularTotalRefeicoes(refeicoes, alimentosPorId) {
  return refeicoes.reduce(
    (total, refeicao) => {
      const doTotal = calcularTotalItens(refeicao.itens, alimentosPorId);
      return { kcal: total.kcal + doTotal.kcal, cho: total.cho + doTotal.cho };
    },
    { kcal: 0, cho: 0 },
  );
}

export function arredondar(valor, casas = 1) {
  const fator = 10 ** casas;
  return Math.round(valor * fator) / fator;
}

// Mesmo arredondamento de `arredondar`, mas devolvendo o texto já pronto pra exibir — com
// vírgula como separador decimal (`toLocaleString('pt-BR')`), a convenção do resto do app,
// nunca ponto. `useGrouping: false` porque isso é só sobre separador decimal, não sobre
// separador de milhar (não introduzir pontos de milhar onde não existiam). Nunca usar no
// `value` de um `<input type="number">` — esses exigem ponto e um valor numérico de verdade,
// não uma string; `QuantidadeDupla` continua com `arredondar` pra esse caso.
export function formatarNumero(valor, casas = 1) {
  return valor.toLocaleString('pt-BR', { useGrouping: false, maximumFractionDigits: casas });
}

// "1 fatia · 25 g" nas listas de busca — sempre em gramas, nunca "ml" (mesmo pra líquidos, que
// no catálogo já vêm com o peso equivalente em `quantidade_g_ml`, não em volume de verdade).
// Sem sufixo de peso pros itens de quantidade_indefinida (~3,5% do catálogo, sem peso
// informado no manual original — ver comentário no topo do arquivo).
export function textoMedidaComPeso(alimento) {
  if (alimento.quantidade_indefinida) return alimento.medida;
  return `${alimento.medida} · ${formatarNumero(alimento.quantidade_g_ml)} g`;
}
