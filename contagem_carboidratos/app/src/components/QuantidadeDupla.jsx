import { Form } from 'react-bootstrap';
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
        <Form.Control
          type="number"
          min="0"
          value={valor}
          autoFocus={autoFocus}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
        />
      </Form.Group>
    );
  }

  const quantidadeMedidas = alimento.quantidade_g_ml ? valor / alimento.quantidade_g_ml : 0;

  return (
    <div className="d-flex gap-2">
      <Form.Group className="flex-fill">
        <Form.Label>Gramas</Form.Label>
        <Form.Control
          type="number"
          min="0"
          value={arredondar(valor, 1)}
          autoFocus={autoFocus}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
        />
      </Form.Group>
      <Form.Group className="flex-fill">
        <Form.Label>Qtd. ({alimento.medida})</Form.Label>
        <Form.Control
          type="number"
          min="0"
          step="0.1"
          value={arredondar(quantidadeMedidas, 2)}
          onChange={(e) => onChange((Number(e.target.value) || 0) * alimento.quantidade_g_ml)}
        />
      </Form.Group>
    </div>
  );
}
