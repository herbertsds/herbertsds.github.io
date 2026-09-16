import { localStorageAdapter } from '../storage/localStorageAdapter';

// Plano nutricional único e ativo (o que foi receitado pela nutricionista).
// Funções assíncronas de propósito: o dia que isso virar uma chamada de API,
// a assinatura (e quem consome) não muda.

const CHAVE = 'plano_nutricional';
const PLANO_VAZIO = { refeicoes: [] };

async function get() {
  return localStorageAdapter.readJSON(CHAVE, PLANO_VAZIO);
}

async function salvar(plano) {
  localStorageAdapter.writeJSON(CHAVE, plano);
  return plano;
}

export const planoNutricionalRepository = { get, salvar };
