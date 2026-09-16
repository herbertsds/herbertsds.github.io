// Faz o Enter (ou o botão "Concluído"/"OK"/"Ir" do teclado virtual, cujo rótulo é controlado
// por enterKeyHint) fechar o teclado em mobile — sem isso o campo não tem um jeito claro de
// confirmar, e o teclado grande fica ocupando a tela até a pessoa tocar fora.
export function fecharTecladoNoEnter(e) {
  if (e.key === 'Enter') e.currentTarget.blur();
}
