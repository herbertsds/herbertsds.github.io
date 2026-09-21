import { localStorageAdapter } from '../storage/localStorageAdapter';
import { somarDias } from '../../lib/data';

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

// Os `quantidadeDias` dias imediatamente ANTERIORES a `dataReferencia` (não inclui ela mesma —
// quem quiser o próprio dia já tem `getByData`). Usado só para sugerir "alimentos usados
// recentemente" em RefeicoesDoDia.jsx; cada dia é uma leitura de localStorage própria (não há
// um índice por período), mas isso é barato mesmo em 15 leituras.
async function getUltimosDias(dataReferencia, quantidadeDias) {
  const datas = Array.from({ length: quantidadeDias }, (_, i) =>
    somarDias(dataReferencia, i - quantidadeDias),
  );
  return Promise.all(datas.map((data) => getByData(data)));
}

export const refeicoesDoDiaRepository = { getByData, salvar, getUltimosDias };
