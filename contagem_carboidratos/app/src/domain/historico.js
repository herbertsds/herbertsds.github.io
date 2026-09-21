// Alimentos usados numa refeição (mesmo tipo) nos dias anteriores — sugestão de "repetir algo
// que já comi" sem precisar buscar de novo. Pega o uso MAIS RECENTE de cada alimento dentro da
// janela recebida (não soma nem faz média): é o que a pessoa comeu da última vez que fez essa
// refeição, o valor mais provável de servir de novo. Nunca sugere um alimento que já está
// lançado na refeição de hoje (`idsJaAdicionados`).
export function alimentosUsadosRecentemente(diasAnteriores, tipo, idsJaAdicionados) {
  const porAlimento = new Map();

  for (const dia of diasAnteriores) {
    for (const refeicao of dia.refeicoes) {
      if (refeicao.tipo !== tipo) continue;
      for (const item of refeicao.itens) {
        if (idsJaAdicionados.has(item.alimentoId)) continue;
        const atual = porAlimento.get(item.alimentoId);
        if (!atual || dia.data > atual.data) {
          porAlimento.set(item.alimentoId, {
            alimentoId: item.alimentoId,
            quantidadeG: item.quantidadeG,
            data: dia.data,
          });
        }
      }
    }
  }

  return Array.from(porAlimento.values()).sort((a, b) => b.data.localeCompare(a.data));
}
