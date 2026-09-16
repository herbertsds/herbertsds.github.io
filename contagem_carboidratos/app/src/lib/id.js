export function gerarId(prefixo = 'id') {
  const aleatorio = Math.random().toString(36).slice(2, 10);
  return `${prefixo}_${Date.now().toString(36)}${aleatorio}`;
}
