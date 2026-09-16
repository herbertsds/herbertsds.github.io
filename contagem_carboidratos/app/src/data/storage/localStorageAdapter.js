// Único arquivo do projeto que toca window.localStorage diretamente.
// Qualquer outro código que precise ler/gravar dados do usuário passa pelos
// repositories em ../repositories, nunca por aqui direto.

const PREFIXO = 'contagem_carboidratos:';

function readJSON(chave, valorPadrao) {
  try {
    const bruto = window.localStorage.getItem(PREFIXO + chave);
    if (bruto === null) return valorPadrao;
    return JSON.parse(bruto);
  } catch (erro) {
    console.error(`Falha ao ler "${chave}" do localStorage`, erro);
    return valorPadrao;
  }
}

function writeJSON(chave, valor) {
  try {
    window.localStorage.setItem(PREFIXO + chave, JSON.stringify(valor));
  } catch (erro) {
    console.error(`Falha ao gravar "${chave}" no localStorage`, erro);
  }
}

function remove(chave) {
  try {
    window.localStorage.removeItem(PREFIXO + chave);
  } catch (erro) {
    console.error(`Falha ao remover "${chave}" do localStorage`, erro);
  }
}

function chavesDoApp() {
  const chaves = [];
  for (let i = 0; i < window.localStorage.length; i++) {
    const chaveCompleta = window.localStorage.key(i);
    if (chaveCompleta && chaveCompleta.startsWith(PREFIXO)) {
      chaves.push(chaveCompleta.slice(PREFIXO.length));
    }
  }
  return chaves;
}

// Usado pela tela de Importar/Exportar: pega tudo que o app guardou (plano, refeições de
// cada dia, edições de alimentos — o que for) sem precisar saber os nomes das chaves, então
// um repository novo no futuro entra automaticamente no backup sem precisar mexer aqui.
function exportarTudo() {
  const dados = {};
  for (const chave of chavesDoApp()) {
    dados[chave] = readJSON(chave, null);
  }
  return dados;
}

function importarTudo(dados) {
  Object.entries(dados).forEach(([chave, valor]) => writeJSON(chave, valor));
}

function possuiAlgumDado() {
  return chavesDoApp().length > 0;
}

export const localStorageAdapter = {
  readJSON,
  writeJSON,
  remove,
  exportarTudo,
  importarTudo,
  possuiAlgumDado,
};
