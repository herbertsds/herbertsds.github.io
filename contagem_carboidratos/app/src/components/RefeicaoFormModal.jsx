import { useEffect, useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { Typeahead } from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import { fecharTecladoNoEnter } from '../utils/teclado';

const TIPOS_PADRAO = [
  'Desjejum',
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

// CRUD de refeição do Plano Nutricional. Campo de tipo com aparência de select (Typeahead do
// react-bootstrap-typeahead, `allowNew`) que mostra os tipos padrão + já cadastrados no plano
// como opções clicáveis, mas aceita digitar qualquer nome novo — os dois num campo só. Antes
// era um `<input list>` com `<datalist>` nativo, mas o Safari do iOS não exibe esse dropdown
// direito (não aparece nenhuma lista visível ao tocar no campo); o Typeahead resolve isso por
// ser inteiramente renderizado em React, sem depender de widget nativo do navegador. Refeições
// do Dia não usam mais este modal — elas vêm automaticamente do plano (ver RefeicoesDoDia.jsx).
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
          <Typeahead
            id="tipo-refeicao"
            allowNew
            newSelectionPrefix="Nova categoria: "
            options={opcoesTipo}
            selected={tipo ? [tipo] : []}
            onInputChange={setTipo}
            onChange={(selecionados) => {
              const escolhido = selecionados[0];
              if (!escolhido) {
                setTipo('');
                return;
              }
              setTipo(typeof escolhido === 'string' ? escolhido : escolhido.label);
            }}
            placeholder="Selecione ou digite um nome novo..."
            inputProps={{ enterKeyHint: 'done', onKeyDown: fecharTecladoNoEnter }}
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
