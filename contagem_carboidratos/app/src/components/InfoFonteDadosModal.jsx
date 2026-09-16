import { Modal, Button } from 'react-bootstrap';

// Créditos da fonte do catálogo de alimentos — aberto pelo botão "ⓘ" ao lado do título.
export function InfoFonteDadosModal({ aberto, onFechar }) {
  return (
    <Modal show={aberto} onHide={onFechar} centered>
      <Modal.Header closeButton>
        <Modal.Title>Sobre os dados de alimentos</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          A tabela de alimentos (medida caseira, calorias e carboidratos) usada neste app vem
          do <strong>Manual de Contagem de Carboidratos</strong>, publicado pela{' '}
          <strong>Sociedade Brasileira de Diabetes (SBD)</strong>.
        </p>
        <p className="mb-0">
          Os dados foram extraídos do PDF original e podem ter sido corrigidos ou
          complementados manualmente na tela <strong>Alimentos</strong> deste app — em caso de
          dúvida, o manual original da SBD é a fonte de referência. Este app é um projeto
          pessoal, sem qualquer vínculo com a SBD, e não substitui orientação nutricional
          profissional.
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onFechar}>
          Fechar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
