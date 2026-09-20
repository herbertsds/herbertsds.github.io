import { useEffect, useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { CampoNumerico } from './CampoNumerico';
import { fecharTecladoNoEnter } from '../utils/teclado';

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
            enterKeyHint="done"
            onKeyDown={fecharTecladoNoEnter}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Medida usual</Form.Label>
          <Form.Control
            placeholder="ex: 1 fatia, 1 colher de sopa..."
            value={campos.medida}
            onChange={(e) => setCampos((c) => ({ ...c, medida: e.target.value }))}
            enterKeyHint="done"
            onKeyDown={fecharTecladoNoEnter}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Peso da medida usual (g)</Form.Label>
          <CampoNumerico
            valor={campos.quantidade_g_ml}
            formatar={(v) => v}
            onChange={(n) => setCampos((c) => ({ ...c, quantidade_g_ml: String(n) }))}
          />
          <Form.Text className="text-muted">
            Deixe 0 se não souber o peso — nesse caso o alimento só pode ser adicionado em
            porções, não em gramas.
          </Form.Text>
        </Form.Group>
        <div className="d-flex gap-2">
          <Form.Group className="flex-fill">
            <Form.Label>Calorias (kcal)</Form.Label>
            <CampoNumerico
              valor={campos.calorias_kcal}
              formatar={(v) => v}
              onChange={(n) => setCampos((c) => ({ ...c, calorias_kcal: String(n) }))}
            />
          </Form.Group>
          <Form.Group className="flex-fill">
            <Form.Label>Carboidratos (g)</Form.Label>
            <CampoNumerico
              valor={campos.carboidratos_g}
              formatar={(v) => v}
              onChange={(n) => setCampos((c) => ({ ...c, carboidratos_g: String(n) }))}
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
