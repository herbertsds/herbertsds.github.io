import { localStorageAdapter } from '../storage/localStorageAdapter';
import { gerarId } from '../../lib/id';

// Alimentos criados pelo usuário, que não existem no catálogo do manual da SBD.
// "Excluir" aqui é sempre soft-delete (`excluido: true`): o registro continua existindo pra
// não quebrar refeições (do plano ou de dias já passados) que já referenciam esse alimento —
// só some da busca/lista usada para adicionar coisa nova daqui pra frente.
const CHAVE = 'alimentos_customizados';

async function getAll() {
  return localStorageAdapter.readJSON(CHAVE, []);
}

async function adicionar(dados) {
  const atuais = await getAll();
  const novo = {
    id: gerarId('custom'),
    quantidade_indefinida: Number(dados.quantidade_g_ml) === 0,
    excluido: false,
    ...dados,
  };
  const novos = [...atuais, novo];
  localStorageAdapter.writeJSON(CHAVE, novos);
  return novo;
}

async function atualizar(alimentoId, dados) {
  const atuais = await getAll();
  const novos = atuais.map((a) => (a.id === alimentoId ? { ...a, ...dados } : a));
  localStorageAdapter.writeJSON(CHAVE, novos);
}

async function excluir(alimentoId) {
  const atuais = await getAll();
  const novos = atuais.map((a) => (a.id === alimentoId ? { ...a, excluido: true } : a));
  localStorageAdapter.writeJSON(CHAVE, novos);
}

export const alimentosCustomizadosRepository = { getAll, adicionar, atualizar, excluir };
