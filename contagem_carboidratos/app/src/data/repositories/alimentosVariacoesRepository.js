import { localStorageAdapter } from '../storage/localStorageAdapter';
import { gerarId } from '../../lib/id';

// Variações de marca de um mesmo alimento (ex: "Pão de forma integral" da Vigor vs. da
// Panco) — podem ser criadas em cima de qualquer alimento, do catálogo ou customizado.
// Cada variação é um conjunto de valores nutricionais próprio, ligado ao alimento "base" por
// alimentoBaseId. Excluir é soft-delete pelo mesmo motivo dos customizados: uma refeição já
// lançada pode estar referenciando essa variação diretamente.
const CHAVE = 'alimentos_variacoes';

async function getAll() {
  return localStorageAdapter.readJSON(CHAVE, []);
}

async function adicionar(alimentoBaseId, dados) {
  const atuais = await getAll();
  const nova = {
    id: gerarId('var'),
    alimentoBaseId,
    excluido: false,
    quantidade_indefinida: Number(dados.quantidade_g_ml) === 0,
    ...dados,
  };
  const novas = [...atuais, nova];
  localStorageAdapter.writeJSON(CHAVE, novas);
  return nova;
}

async function excluir(variacaoId) {
  const atuais = await getAll();
  const novas = atuais.map((v) => (v.id === variacaoId ? { ...v, excluido: true } : v));
  localStorageAdapter.writeJSON(CHAVE, novas);
}

export const alimentosVariacoesRepository = { getAll, adicionar, excluir };
