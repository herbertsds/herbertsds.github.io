import { useEffect, useState } from 'react';
import { Form } from 'react-bootstrap';
import { fecharTecladoNoEnter } from '../utils/teclado';

// Campo numérico mobile-friendly: `type="text"` + `inputMode="decimal"` em vez de
// `type="number"` (no iOS o teclado numérico de type=number não tem botão pra fechar;
// inputMode dá o mesmo teclado com a barra "Concluído"), e o texto digitado fica num estado
// próprio, sem isso ao apagar tudo o campo reexibe "0" na hora — e o próximo dígito vira "0X"
// em vez de substituir. Só resincroniza com `valor` (ex: o outro campo de QuantidadeDupla
// recalculando este) quando o campo NÃO está focado.
export function CampoNumerico({ valor, formatar = (v) => String(v), onChange, ...props }) {
  const [texto, setTexto] = useState(formatar(valor));
  const [focado, setFocado] = useState(false);

  useEffect(() => {
    if (!focado) setTexto(formatar(valor));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valor, focado]);

  return (
    <Form.Control
      type="text"
      inputMode="decimal"
      enterKeyHint="done"
      value={texto}
      onFocus={() => setFocado(true)}
      onChange={(e) => {
        const bruto = e.target.value;
        setTexto(bruto);
        onChange(Number(bruto.replace(',', '.')) || 0);
      }}
      onBlur={() => {
        setFocado(false);
        setTexto(formatar(valor));
      }}
      onKeyDown={fecharTecladoNoEnter}
      {...props}
    />
  );
}
