import { useEffect, useState } from 'react';
import { Modal, Form, Button, ListGroup } from 'react-bootstrap';
import { arredondar } from '../domain/calculos';

const CAMPOS_VAZIOS = { nomeVariacao: '', medida: '', quantidade_g_ml: '0', calorias_kcal: '0', carboidratos_g: '0' };

// Gerencia as variações de marca de um alimento (ex: "Pão de forma integral" → "Vigor",
// "Panco"...). Pode ser aberto para qualquer alimento, do catálogo ou customizado.
export function AlimentoVariacoesModal({ alimentoBase, variacoes, aberto, onFechar, onCriar, onExcluir }) {
  const [campos, setCampos] = useState(CAMPOS_VAZIOS);

  useEffect(() => {
    if (aberto) setCampos(CAMPOS_VAZIOS);
  }, [aberto, alimentoBase]);

  if (!alimentoBase) return null;

  const podeSalvar = campos.nomeVariacao.trim().length > 0 && campos.medida.trim().length > 0;

  function adicionar() {
    const quantidade = Number(campos.quantidade_g_ml) || 0;
    onCriar({
      nomeVariacao: campos.nomeVariacao.trim(),
      medida: campos.medida.trim(),
      quantidade_g_ml: quantidade,
      calorias_kcal: Number(campos.calorias_kcal) || 0,
      carboidratos_g: Number(campos.carboidratos_g) || 0,
      quantidade_indefinida: quantidade === 0,
    });
    setCampos(CAMPOS_VAZIOS);
  }

  return (
    <Modal show={aberto} onHide={onFechar} centered>
      <Modal.Header closeButton>
        <Modal.Title>Variações de {alimentoBase.alimento}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {variacoes.length > 0 && (
          <ListGroup className="mb-3">
            {variacoes.map((v) => (
              <ListGroup.Item key={v.id} className="d-flex justify-content-between align-items-start gap-2">
                <div>
                  <div>{v.nomeVariacao}</div>
                  <small className="text-muted">
                    {v.medida} (
                    {v.quantidade_indefinida ? 'sem peso definido' : `${v.quantidade_g_ml}g/ml`}
                    ) · {Math.round(v.calorias_kcal)} kcal · {arredondar(v.carboidratos_g)} g CHO
                  </small>
                </div>
                <Button size="sm" variant="outline-danger" onClick={() => onExcluir(v.id)}>
                  Excluir
                </Button>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}

        <div className="fw-semibold small mb-2">Nova variação</div>
        <Form.Group className="mb-2">
          <Form.Label>Nome da variação (ex: marca)</Form.Label>
          <Form.Control
            placeholder="ex: Vigor, Panco..."
            value={campos.nomeVariacao}
            onChange={(e) => setCampos((c) => ({ ...c, nomeVariacao: e.target.value }))}
          />
        </Form.Group>
        <Form.Group className="mb-2">
          <Form.Label>Medida usual</Form.Label>
          <Form.Control
            placeholder="ex: 1 fatia"
            value={campos.medida}
            onChange={(e) => setCampos((c) => ({ ...c, medida: e.target.value }))}
          />
        </Form.Group>
        <Form.Group className="mb-2">
          <Form.Label>Peso/volume da medida usual (g ou ml)</Form.Label>
          <Form.Control
            type="number"
            min="0"
            value={campos.quantidade_g_ml}
            onChange={(e) => setCampos((c) => ({ ...c, quantidade_g_ml: e.target.value }))}
          />
        </Form.Group>
        <div className="d-flex gap-2 mb-2">
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
        <Button size="sm" disabled={!podeSalvar} onClick={adicionar}>
          Adicionar variação
        </Button>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onFechar}>
          Fechar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
