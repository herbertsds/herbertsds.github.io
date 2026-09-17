import { useEffect, useState } from 'react';
import { Form } from 'react-bootstrap';
import { fecharTecladoNoEnter } from '../utils/teclado';

// Campo numérico mobile-friendly: `type="text"` + `inputMode="decimal"` em vez de
// `type="number"` (no iOS o teclado numérico de type=number não tem botão pra fechar;
// inputMode dá o mesmo teclado com a barra "Concluído"), e o texto digitado fica num estado
// próprio, sem isso ao apagar tudo o campo reexibe "0" na hora — e o próximo dígito vira "0X"
// em vez de substituir. Só para de resincronizar com `valor` (ex: o outro campo de
// QuantidadeDupla recalculando este) depois que a pessoa realmente digita algo — não já ao
// focar. Importante pro campo com `autoFocus` (ex: abrir o modal de quantidade com uma
// quantidade inicial vinda de fora, tipo a sugestão do plano): o foco automático do navegador
// dispara ANTES do valor inicial terminar de chegar por uma prop assíncrona, e se a mera
// presença de foco já bloqueasse a resincronização, o campo ficaria travado mostrando o valor
// velho (bug real, pego durante o desenvolvimento: "Gramas" ficava em 0 enquanto "Qtd." — sem
// autoFocus — mostrava o valor certo).
export function CampoNumerico({ valor, formatar = (v) => String(v), onChange, ...props }) {
  const [texto, setTexto] = useState(formatar(valor));
  const [editando, setEditando] = useState(false);

  useEffect(() => {
    if (!editando) setTexto(formatar(valor));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valor, editando]);

  return (
    <Form.Control
      type="text"
      inputMode="decimal"
      enterKeyHint="done"
      value={texto}
      onChange={(e) => {
        const bruto = e.target.value;
        setEditando(true);
        setTexto(bruto);
        onChange(Number(bruto.replace(',', '.')) || 0);
      }}
      onBlur={() => {
        setEditando(false);
        setTexto(formatar(valor));
      }}
      onKeyDown={fecharTecladoNoEnter}
      {...props}
    />
  );
}
