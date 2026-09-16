import { localStorageAdapter } from '../storage/localStorageAdapter';

// Correções locais em cima do catálogo estático (alguns valores do manual podem estar
// errados). Guardado à parte do JSON original — nunca reescrevemos o arquivo estático,
// só sobrepomos os campos editados por id na hora de ler.
const CHAVE = 'alimentos_overrides';

async function getAll() {
  return localStorageAdapter.readJSON(CHAVE, {});
}

async function salvarOverride(alimentoId, dados) {
  const atuais = await getAll();
  const novos = { ...atuais, [alimentoId]: { ...atuais[alimentoId], ...dados } };
  localStorageAdapter.writeJSON(CHAVE, novos);
  return novos;
}

// "Reverter edição": remove só a correção, o item volta a mostrar os valores originais do JSON.
async function remover(alimentoId) {
  const atuais = await getAll();
  const { [alimentoId]: _removido, ...resto } = atuais;
  localStorageAdapter.writeJSON(CHAVE, resto);
  return resto;
}

export const alimentosOverridesRepository = { getAll, salvarOverride, remover };
