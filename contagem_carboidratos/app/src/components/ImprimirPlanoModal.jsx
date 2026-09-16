import { Modal, Form, Button } from 'react-bootstrap';
import { fecharTecladoNoEnter } from '../utils/teclado';

// Antes de imprimir/gerar o PDF do plano, pergunta o nome da pessoa (pra virar "Plano
// Nutricional - Nome" no papel, ver PlanoNutricional.jsx) e quais eixos mostrar nos números
// grandes de cada refeição — às vezes só interessa levar um dos dois (ex: alguém que só
// controla carboidratos não precisa de calorias impresso). Toggle, não checkbox, pra combinar
// com o resto do app (Respeitar calorias/carboidratos na Substituição).
export function ImprimirPlanoModal({
  aberto,
  nome,
  onNomeChange,
  mostrarKcal,
  mostrarCho,
  onMostrarKcalChange,
  onMostrarChoChange,
  onFechar,
  onImprimir,
}) {
  const podeImprimir = mostrarKcal || mostrarCho;

  return (
    <Modal show={aberto} onHide={onFechar} centered>
      <Modal.Header closeButton>
        <Modal.Title>Imprimir plano</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group className="mb-3">
          <Form.Label>Nome da pessoa (opcional)</Form.Label>
          <Form.Control
            value={nome}
            onChange={(e) => onNomeChange(e.target.value)}
            placeholder="ex: Maria Silva"
            autoFocus
            enterKeyHint="done"
            onKeyDown={fecharTecladoNoEnter}
          />
        </Form.Group>
        <Form.Group className="mb-2">
          <Form.Label className="d-block">O que mostrar nos números</Form.Label>
          <Form.Check
            type="switch"
            id="imprimir-mostrar-kcal"
            label="Calorias"
            checked={mostrarKcal}
            onChange={(e) => onMostrarKcalChange(e.target.checked)}
          />
          <Form.Check
            type="switch"
            id="imprimir-mostrar-cho"
            label="Carboidratos"
            checked={mostrarCho}
            onChange={(e) => onMostrarChoChange(e.target.checked)}
          />
        </Form.Group>
        {!podeImprimir && <div className="text-danger small">Escolha pelo menos um dos dois.</div>}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onFechar}>
          Cancelar
        </Button>
        <Button variant="primary" disabled={!podeImprimir} onClick={onImprimir}>
          Imprimir
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
