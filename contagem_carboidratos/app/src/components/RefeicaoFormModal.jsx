import { useEffect, useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';

const TIPOS_PADRAO = [
  'Café da Manhã',
  'Colação',
  'Almoço',
  'Lanche da Tarde',
  'Lanche da Noite/Jantar',
  'Ceia',
];

function montarOpcoesTipo(tiposExistentes) {
  return Array.from(new Set([...TIPOS_PADRAO, ...(tiposExistentes || [])]));
}

// CRUD de refeição do Plano Nutricional. Select simples com os tipos padrão + já existentes.
// Refeições do Dia não usam mais este modal — elas vêm
// automaticamente do plano (ver RefeicoesDoDia.jsx).
export function RefeicaoFormModal({ aberto, refeicaoInicial, tiposExistentes, onFechar, onSalvar }) {
  const [tipo, setTipo] = useState('');
  const [horario, setHorario] = useState('');

  useEffect(() => {
    if (aberto) {
      setTipo(refeicaoInicial ? refeicaoInicial.tipo : '');
      setHorario(refeicaoInicial ? refeicaoInicial.horario : '');
    }
  }, [aberto, refeicaoInicial]);

  const opcoesTipo = montarOpcoesTipo(tiposExistentes);
  const podeSalvar = tipo.trim().length > 0 && horario.trim().length > 0;

  return (
    <Modal show={aberto} onHide={onFechar} centered>
      <Modal.Header closeButton>
        <Modal.Title>{refeicaoInicial ? 'Editar refeição' : 'Adicionar refeição'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group className="mb-3">
          <Form.Label>Tipo de refeição</Form.Label>
          <Form.Select value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="">Selecione...</option>
            {opcoesTipo.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
        <Form.Group>
          <Form.Label>Horário</Form.Label>
          <Form.Control
            type="time"
            value={horario}
            onChange={(e) => setHorario(e.target.value)}
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onFechar}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          disabled={!podeSalvar}
          onClick={() => {
            onSalvar({ tipo: tipo.trim(), horario });
            onFechar();
          }}
        >
          Salvar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
