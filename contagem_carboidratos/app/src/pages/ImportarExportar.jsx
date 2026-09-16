import { useState } from 'react';
import { Button, Form, Alert, Modal } from 'react-bootstrap';
import { localStorageAdapter } from '../data/storage/localStorageAdapter';

// Solução temporária enquanto o app não tem um backend de verdade: exporta tudo que está
// salvo (plano, refeições de cada dia, edições de alimentos) como uma string pra área de
// transferência, e importa de volta colando essa string em outro navegador/dispositivo.
export function ImportarExportar() {
  const [textoImportar, setTextoImportar] = useState('');
  const [mensagem, setMensagem] = useState(null);
  const [erro, setErro] = useState(null);
  const [confirmando, setConfirmando] = useState(false);
  const [importado, setImportado] = useState(false);

  async function exportar() {
    setErro(null);
    setMensagem(null);
    try {
      const dados = localStorageAdapter.exportarTudo();
      const texto = JSON.stringify(dados);
      await navigator.clipboard.writeText(texto);
      setMensagem('Dados copiados para a área de transferência.');
    } catch {
      setErro('Não foi possível copiar automaticamente — copie o texto manualmente do campo abaixo.');
    }
  }

  function pedirImportacao() {
    setErro(null);
    setMensagem(null);
    if (!textoImportar.trim()) {
      setErro('Cole o texto exportado no campo antes de importar.');
      return;
    }
    if (localStorageAdapter.possuiAlgumDado()) {
      setConfirmando(true);
      return;
    }
    aplicarImportacao();
  }

  function aplicarImportacao() {
    setConfirmando(false);
    try {
      const dados = JSON.parse(textoImportar);
      localStorageAdapter.importarTudo(dados);
      setImportado(true);
      setMensagem('Dados importados com sucesso.');
    } catch {
      setErro('Não foi possível ler os dados colados — confira se copiou o texto certo.');
    }
  }

  return (
    <div className="pb-5">
      <h1 className="h5 mb-3">Importar / Exportar dados</h1>
      <p className="text-muted small">
        Solução temporária enquanto o app não salva tudo num servidor: exporte os dados de um
        dispositivo e importe em outro colando o texto copiado.
      </p>

      <div className="mb-4">
        <Button onClick={exportar}>Exportar (copiar para a área de transferência)</Button>
      </div>

      <Form.Group className="mb-2">
        <Form.Label>Importar</Form.Label>
        <Form.Control
          as="textarea"
          rows={6}
          placeholder="Cole aqui o texto exportado de outro dispositivo..."
          value={textoImportar}
          onChange={(e) => setTextoImportar(e.target.value)}
        />
      </Form.Group>
      <Button variant="outline-primary" onClick={pedirImportacao}>
        Importar
      </Button>

      {mensagem && (
        <Alert variant="success" className="mt-3 py-2 small mb-0">
          {mensagem}
          {importado && (
            <div className="mt-2">
              <Button size="sm" variant="success" onClick={() => window.location.reload()}>
                Recarregar página
              </Button>
            </div>
          )}
        </Alert>
      )}
      {erro && (
        <Alert variant="danger" className="mt-3 py-2 small mb-0">
          {erro}
        </Alert>
      )}

      <Modal show={confirmando} onHide={() => setConfirmando(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Isso vai sobrescrever seus dados</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Já existem dados salvos neste dispositivo (plano, refeições registradas, etc.).
          Importar vai substituir tudo pelo conteúdo colado. Essa ação não pode ser desfeita.
          Continuar?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setConfirmando(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={aplicarImportacao}>
            Sobrescrever e importar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
