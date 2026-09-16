// Busca/ranking de alimentos, usado em todo lugar do app que pesquisa no catálogo.
// Fuse.js em modo "extended search": cada token da consulta vira uma condição de
// inclusão exata ('token), e condições separadas por espaço são combinadas com E lógico —
// por isso "leite integral" bate em "Leite de vaca integral" sem precisar ser substring
// contígua da string original.
// Depois do Fuse, itens cujo nome começa com a consulta exata sobem para o topo (precedência
// de prefixo), o resto fica ordenado pelo score de relevância do Fuse.

import Fuse from 'fuse.js';

let fuseInstancia = null;
let alimentosIndexados = null;

export function normalizarTexto(texto) {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

function obterFuse(alimentos) {
  if (fuseInstancia && alimentosIndexados === alimentos) return fuseInstancia;

  const indexados = alimentos.map((alimento) => ({
    ...alimento,
    _busca: normalizarTexto(alimento.alimento),
  }));

  fuseInstancia = new Fuse(indexados, {
    keys: ['_busca'],
    threshold: 0.3,
    ignoreLocation: true,
    useExtendedSearch: true,
    includeScore: true,
  });
  alimentosIndexados = alimentos;
  return fuseInstancia;
}

export function buscarAlimentos(alimentos, consulta, limite = 30) {
  const consultaLimpa = (consulta ?? '').trim();
  if (!consultaLimpa) return alimentos.slice(0, limite);

  const consultaNormalizada = normalizarTexto(consultaLimpa);
  const tokens = consultaNormalizada.split(/\s+/).filter(Boolean);
  const padrao = tokens.map((token) => `'${token}`).join(' ');

  const resultados = obterFuse(alimentos).search(padrao);

  return resultados
    .map((resultado) => ({
      alimento: resultado.item,
      score: resultado.score ?? 1,
      prefixo: resultado.item._busca.startsWith(consultaNormalizada),
    }))
    .sort((a, b) => (a.prefixo === b.prefixo ? a.score - b.score : a.prefixo ? -1 : 1))
    .slice(0, limite)
    .map((resultado) => resultado.alimento);
}
