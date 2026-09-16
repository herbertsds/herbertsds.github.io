// Merge do backup de "Alimentos" (overrides + customizados + variações) contra o que já está
// salvo localmente, em vez de só substituir tudo: o que só existe de um lado entra direto, e
// só o que existe dos dois lados COM CONTEÚDO DIFERENTE vira conflito, pra pessoa escolher.

function igual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

// `alimentos_overrides` é um mapa { [alimentoId]: camposEditados }.
function mesclarMapa(meu, importado, colecao) {
  const resultado = { ...meu };
  const conflitos = [];
  for (const [id, item] of Object.entries(importado || {})) {
    const meuItem = meu[id];
    if (!meuItem) resultado[id] = item;
    else if (!igual(meuItem, item)) conflitos.push({ colecao, id, meu: meuItem, importado: item });
  }
  return { resultado, conflitos };
}

// `alimentos_customizados`/`alimentos_variacoes` são arrays de objetos com `id`.
function mesclarLista(minha, importada, colecao) {
  const mapaMeu = new Map((minha || []).map((item) => [item.id, item]));
  const resultado = new Map(mapaMeu);
  const conflitos = [];
  for (const item of importada || []) {
    const meuItem = mapaMeu.get(item.id);
    if (!meuItem) resultado.set(item.id, item);
    else if (!igual(meuItem, item)) conflitos.push({ colecao, id: item.id, meu: meuItem, importado: item });
  }
  return { resultado: Array.from(resultado.values()), conflitos };
}

// `meus`/`importados`: { alimentos_overrides, alimentos_customizados, alimentos_variacoes }.
// Devolve o resultado já mesclado (com os conflitos ainda valendo "meu", até serem
// resolvidos) e a lista de conflitos pra exibir num modal.
export function mesclarAlimentos(meus, importados) {
  const overrides = mesclarMapa(meus.alimentos_overrides, importados.alimentos_overrides, 'overrides');
  const customizados = mesclarLista(meus.alimentos_customizados, importados.alimentos_customizados, 'customizados');
  const variacoes = mesclarLista(meus.alimentos_variacoes, importados.alimentos_variacoes, 'variacoes');

  return {
    resultado: {
      alimentos_overrides: overrides.resultado,
      alimentos_customizados: customizados.resultado,
      alimentos_variacoes: variacoes.resultado,
    },
    conflitos: [...overrides.conflitos, ...customizados.conflitos, ...variacoes.conflitos],
  };
}

// `escolhas`: Map de `${colecao}:${id}` -> 'meu' | 'importado'. Aplica a escolha de cada
// conflito em cima do resultado já mesclado.
export function aplicarResolucoes(resultadoBase, conflitos, escolhas) {
  const dados = {
    alimentos_overrides: { ...resultadoBase.alimentos_overrides },
    alimentos_customizados: [...resultadoBase.alimentos_customizados],
    alimentos_variacoes: [...resultadoBase.alimentos_variacoes],
  };
  for (const c of conflitos) {
    const valor = escolhas.get(`${c.colecao}:${c.id}`) === 'importado' ? c.importado : c.meu;
    if (c.colecao === 'overrides') {
      dados.alimentos_overrides[c.id] = valor;
    } else {
      const chave = c.colecao === 'customizados' ? 'alimentos_customizados' : 'alimentos_variacoes';
      const indice = dados[chave].findIndex((item) => item.id === c.id);
      if (indice >= 0) dados[chave][indice] = valor;
    }
  }
  return dados;
}

export function rotuloConflito(c) {
  return c.meu.alimento || c.importado.alimento || c.meu.nomeVariacao || c.importado.nomeVariacao || `id ${c.id}`;
}
