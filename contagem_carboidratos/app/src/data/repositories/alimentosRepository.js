// Catálogo de alimentos: hoje é um JSON estático publicado junto com o build
// (public/alimentos.json), com três camadas por cima:
//   1. correções locais em cima de itens existentes (alimentosOverridesRepository)
//   2. alimentos criados pelo usuário, que não existem no manual (alimentosCustomizadosRepository)
//   3. variações de marca de qualquer um dos dois acima (alimentosVariacoesRepository)
// getAll() devolve TUDO (inclusive excluídos, pra refeições antigas continuarem resolvendo
// nome/valores) — getDisponiveis() filtra excluídos E variações (que só aparecem através do
// seletor de variação, nunca como resultado de busca direto) — é o que se usa pra buscar algo
// novo pra adicionar numa refeição. O resto do app não sabe dessa mecânica, só chama os
// métodos. Se um dia isso virar uma API, só este arquivo muda.

import { alimentosOverridesRepository } from './alimentosOverridesRepository';
import { alimentosCustomizadosRepository } from './alimentosCustomizadosRepository';
import { alimentosVariacoesRepository } from './alimentosVariacoesRepository';

let cache = null;

async function getAll() {
  if (cache) return cache;
  const resposta = await fetch(`${import.meta.env.BASE_URL}alimentos.json`);
  if (!resposta.ok) {
    throw new Error('Não foi possível carregar a lista de alimentos.');
  }
  const base = await resposta.json();
  const overrides = await alimentosOverridesRepository.getAll();
  const doCatalogo = base.map((alimento) =>
    overrides[alimento.id] ? { ...alimento, ...overrides[alimento.id], _editado: true } : alimento,
  );
  const customizados = await alimentosCustomizadosRepository.getAll();
  const semVariacoes = [...doCatalogo, ...customizados.map((a) => ({ ...a, _adicionado: true }))];

  const nomesPorId = new Map(semVariacoes.map((a) => [a.id, a.alimento]));
  const variacoes = await alimentosVariacoesRepository.getAll();
  const comoAlimentos = variacoes.map((v) => ({
    id: v.id,
    alimento: `${nomesPorId.get(v.alimentoBaseId) ?? '?'} (${v.nomeVariacao})`,
    medida: v.medida,
    quantidade_g_ml: v.quantidade_g_ml,
    calorias_kcal: v.calorias_kcal,
    carboidratos_g: v.carboidratos_g,
    quantidade_indefinida: v.quantidade_indefinida,
    excluido: v.excluido,
    _variacao: true,
    alimentoBaseId: v.alimentoBaseId,
    nomeVariacao: v.nomeVariacao,
  }));

  cache = [...semVariacoes, ...comoAlimentos];
  return cache;
}

async function getDisponiveis() {
  const todos = await getAll();
  return todos.filter((alimento) => !alimento.excluido && !alimento._variacao);
}

async function getById(id) {
  const alimentos = await getAll();
  return alimentos.find((alimento) => alimento.id === id) ?? null;
}

async function salvarEdicao(alimentoId, dados) {
  await alimentosOverridesRepository.salvarOverride(alimentoId, dados);
  cache = null;
}

async function removerEdicao(alimentoId) {
  await alimentosOverridesRepository.remover(alimentoId);
  cache = null;
}

async function adicionarCustomizado(dados) {
  const novo = await alimentosCustomizadosRepository.adicionar(dados);
  cache = null;
  return novo;
}

async function atualizarCustomizado(alimentoId, dados) {
  await alimentosCustomizadosRepository.atualizar(alimentoId, dados);
  cache = null;
}

async function excluirCustomizado(alimentoId) {
  await alimentosCustomizadosRepository.excluir(alimentoId);
  cache = null;
}

async function criarVariacao(alimentoBaseId, dados) {
  const nova = await alimentosVariacoesRepository.adicionar(alimentoBaseId, dados);
  cache = null;
  return nova;
}

async function excluirVariacao(variacaoId) {
  await alimentosVariacoesRepository.excluir(variacaoId);
  cache = null;
}

export const alimentosRepository = {
  getAll,
  getDisponiveis,
  getById,
  salvarEdicao,
  removerEdicao,
  adicionarCustomizado,
  atualizarCustomizado,
  excluirCustomizado,
  criarVariacao,
  excluirVariacao,
};
