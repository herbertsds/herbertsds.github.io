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

// Backup por categoria: o usuário pode querer levar só o plano (ou só o catálogo de
// alimentos) para outro dispositivo, sem sobrescrever as refeições já registradas lá. Cada
// categoria reconhece suas chaves pelo nome/prefixo, sem que o repository correspondente
// precise saber nada sobre backup.
const CATEGORIAS = {
  planos: (chave) => chave === 'plano_nutricional',
  refeicoes: (chave) => chave.startsWith('refeicoes_do_dia:'),
  alimentos: (chave) =>
    chave === 'alimentos_overrides' || chave === 'alimentos_customizados' || chave === 'alimentos_variacoes',
};

function chavesDaCategoria(categoria) {
  const pertenceACategoria = CATEGORIAS[categoria];
  return chavesDoApp().filter(pertenceACategoria);
}

function exportarCategoria(categoria) {
  const dados = {};
  for (const chave of chavesDaCategoria(categoria)) {
    dados[chave] = readJSON(chave, null);
  }
  return dados;
}

// Sobrescreve só as chaves dessa categoria: remove todas as que já existiam (pra um dia
// removido no dispositivo de origem também sumir daqui) e grava as do backup importado —
// filtrando por `pertenceACategoria`, já que `dados` pode ser um payload combinado com chaves
// de outras categorias juntas (export com mais de um toggle marcado).
function importarCategoria(categoria, dados) {
  const pertenceACategoria = CATEGORIAS[categoria];
  for (const chave of chavesDaCategoria(categoria)) {
    remove(chave);
  }
  Object.entries(dados).forEach(([chave, valor]) => {
    if (pertenceACategoria(chave)) writeJSON(chave, valor);
  });
}

function possuiDadosDaCategoria(categoria) {
  return chavesDaCategoria(categoria).length > 0;
}

export const localStorageAdapter = {
  readJSON,
  writeJSON,
  remove,
  exportarTudo,
  importarTudo,
  possuiAlgumDado,
  exportarCategoria,
  importarCategoria,
  possuiDadosDaCategoria,
};
