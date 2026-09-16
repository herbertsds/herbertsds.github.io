import { useEffect, useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';

const VAZIO = { alimento: '', medida: '', quantidade_g_ml: '0', calorias_kcal: '0', carboidratos_g: '0' };

// Um modal só para os dois casos: criar um alimento novo (não existe no catálogo) e editar um
// existente (correção de valor errado do manual). A diferença de comportamento fica em
// onSalvar, que cada tela (Alimentos.jsx) resolve de um jeito diferente.
export function AlimentoFormModal({ modo, alimento, aberto, onFechar, onSalvar }) {
  const [campos, setCampos] = useState(VAZIO);

  useEffect(() => {
    if (!aberto) return;
    setCampos(
      alimento
        ? {
            alimento: alimento.alimento,
            medida: alimento.medida,
            quantidade_g_ml: String(alimento.quantidade_g_ml),
            calorias_kcal: String(alimento.calorias_kcal),
            carboidratos_g: String(alimento.carboidratos_g),
          }
        : VAZIO,
    );
  }, [aberto, alimento]);

  const podeSalvar = campos.alimento.trim().length > 0 && campos.medida.trim().length > 0;

  function salvar() {
    const quantidade = Number(campos.quantidade_g_ml) || 0;
    onSalvar({
      alimento: campos.alimento.trim(),
      medida: campos.medida.trim(),
      quantidade_g_ml: quantidade,
      calorias_kcal: Number(campos.calorias_kcal) || 0,
      carboidratos_g: Number(campos.carboidratos_g) || 0,
      quantidade_indefinida: quantidade === 0,
    });
    onFechar();
  }

  return (
    <Modal show={aberto} onHide={onFechar} centered>
      <Modal.Header closeButton>
        <Modal.Title>{modo === 'criar' ? 'Adicionar alimento' : 'Editar alimento'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group className="mb-3">
          <Form.Label>Nome do alimento</Form.Label>
          <Form.Control
            value={campos.alimento}
            onChange={(e) => setCampos((c) => ({ ...c, alimento: e.target.value }))}
            autoFocus={modo === 'criar'}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Medida usual</Form.Label>
          <Form.Control
            placeholder="ex: 1 fatia, 1 colher de sopa..."
            value={campos.medida}
            onChange={(e) => setCampos((c) => ({ ...c, medida: e.target.value }))}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Peso/volume da medida usual (g ou ml)</Form.Label>
          <Form.Control
            type="number"
            min="0"
            value={campos.quantidade_g_ml}
            onChange={(e) => setCampos((c) => ({ ...c, quantidade_g_ml: e.target.value }))}
          />
          <Form.Text className="text-muted">
            Deixe 0 se não souber o peso — nesse caso o alimento só pode ser adicionado em
            porções, não em gramas.
          </Form.Text>
        </Form.Group>
        <div className="d-flex gap-2">
          <Form.Group className="flex-fill">
            <Form.Label>Calorias (kcal)</Form.Label>
            <Form.Control
              type="number"
              min="0"
              value={campos.calorias_kcal}
              onChange={(e) => setCampos((c) => ({ ...c, calorias_kcal: e.target.value }))}
            />
          </Form.Group>
          <Form.Group className="flex-fill">
            <Form.Label>Carboidratos (g)</Form.Label>
            <Form.Control
              type="number"
              min="0"
              value={campos.carboidratos_g}
              onChange={(e) => setCampos((c) => ({ ...c, carboidratos_g: e.target.value }))}
            />
          </Form.Group>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onFechar}>
          Cancelar
        </Button>
        <Button variant="primary" disabled={!podeSalvar} onClick={salvar}>
          Salvar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
