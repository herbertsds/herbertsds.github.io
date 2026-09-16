import { localStorageAdapter } from '../storage/localStorageAdapter';

// O que foi realmente comido, um registro por data (chave 'YYYY-MM-DD').
// Cada dia começa vazio — não há carregamento automático do dia anterior.

const PREFIXO_CHAVE = 'refeicoes_do_dia:';

function chaveParaData(data) {
  return `${PREFIXO_CHAVE}${data}`;
}

function diaVazio(data) {
  return { data, refeicoes: [] };
}

async function getByData(data) {
  return localStorageAdapter.readJSON(chaveParaData(data), diaVazio(data));
}

async function salvar(diaRegistro) {
  localStorageAdapter.writeJSON(chaveParaData(diaRegistro.data), diaRegistro);
  return diaRegistro;
}

export const refeicoesDoDiaRepository = { getByData, salvar };
