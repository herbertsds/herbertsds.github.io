import { Form } from 'react-bootstrap';
import { CampoNumerico } from './CampoNumerico';
import { arredondar } from '../domain/calculos';

// Dois campos ligados: gramas e "quantidade" (múltiplo da medida usual do alimento). Editar
// um recalcula o outro na hora. `valor` é sempre o que fica salvo no item (quantidadeG) —
// gramas para alimentos normais, número de porções para os de quantidade_indefinida (mesma
// convenção usada em todo o resto do app).
export function QuantidadeDupla({ alimento, valor, onChange, autoFocus }) {
  if (!alimento) return null;

  if (alimento.quantidade_indefinida) {
    return (
      <Form.Group>
        <Form.Label>Quantas porções ({alimento.medida})?</Form.Label>
        <CampoNumerico valor={valor} onChange={onChange} autoFocus={autoFocus} />
      </Form.Group>
    );
  }

  const quantidadeMedidas = alimento.quantidade_g_ml ? valor / alimento.quantidade_g_ml : 0;

  return (
    <div className="d-flex gap-2">
      <Form.Group className="flex-fill">
        <Form.Label>Gramas</Form.Label>
        <CampoNumerico
          valor={valor}
          formatar={(v) => String(arredondar(v, 1))}
          onChange={onChange}
          autoFocus={autoFocus}
        />
      </Form.Group>
      <Form.Group className="flex-fill">
        <Form.Label>Qtd. ({alimento.medida})</Form.Label>
        <CampoNumerico
          valor={quantidadeMedidas}
          formatar={(v) => String(arredondar(v, 2))}
          onChange={(n) => onChange(n * alimento.quantidade_g_ml)}
        />
      </Form.Group>
    </div>
  );
}
