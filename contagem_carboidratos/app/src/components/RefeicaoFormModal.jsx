import { useEffect, useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { Typeahead } from 'react-bootstrap-typeahead';

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

// CRUD de refeição do Plano Nutricional. O select de tipo permite escolher um dos padrões
// ou digitar um nome novo (allowNew). Refeições do Dia não usam mais este modal — elas vêm
// automaticamente do plano (ver RefeicoesDoDia.jsx).
export function RefeicaoFormModal({ aberto, refeicaoInicial, tiposExistentes, onFechar, onSalvar }) {
  const [tipo, setTipo] = useState([]);
  const [horario, setHorario] = useState('');

  useEffect(() => {
    if (aberto) {
      setTipo(refeicaoInicial ? [refeicaoInicial.tipo] : []);
      setHorario(refeicaoInicial ? refeicaoInicial.horario : '');
    }
  }, [aberto, refeicaoInicial]);

  const opcoesTipo = montarOpcoesTipo(tiposExistentes);
  const tipoEscolhido = tipo[0] || '';
  const podeSalvar = String(tipoEscolhido).trim().length > 0 && horario.trim().length > 0;

  return (
    <Modal show={aberto} onHide={onFechar} centered>
      <Modal.Header closeButton>
        <Modal.Title>{refeicaoInicial ? 'Editar refeição' : 'Adicionar refeição'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group className="mb-3">
          <Form.Label>Tipo de refeição</Form.Label>
          <Typeahead
            id="tipo-refeicao"
            allowNew
            newSelectionPrefix="Nova refeição: "
            options={opcoesTipo}
            selected={tipo}
            onChange={(selecionados) => {
              const valor = selecionados[0];
              if (!valor) {
                setTipo([]);
                return;
              }
              setTipo([typeof valor === 'string' ? valor : (valor.label ?? valor.tipo ?? '')]);
            }}
            placeholder="Selecione ou digite um novo tipo"
          />
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
            onSalvar({ tipo: String(tipoEscolhido).trim(), horario });
            onFechar();
          }}
        >
          Salvar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
