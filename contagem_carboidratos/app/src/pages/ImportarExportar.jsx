import { useState } from 'react';
import { Button, Form, Alert, Modal } from 'react-bootstrap';
import { localStorageAdapter } from '../data/storage/localStorageAdapter';
import { mesclarAlimentos, aplicarResolucoes, rotuloConflito } from '../domain/mergeAlimentos';

const CATEGORIAS = [
  { chave: 'planos', titulo: 'Planos' },
  { chave: 'refeicoes', titulo: 'Refeições' },
  { chave: 'alimentos', titulo: 'Alimentos' },
];

const CHAVES_ALIMENTOS = ['alimentos_overrides', 'alimentos_customizados', 'alimentos_variacoes'];

// Backup: exporta as categorias marcadas nos toggles num payload só, copiado pra área de
// transferência. Importar é um botão só — lê a área de transferência sozinho (sem colar) e
// decide o que importar pelo `categorias` do próprio payload. Planos/Refeições substituem
// (como antes); Alimentos faz merge (ver domain/mergeAlimentos.js): o que não conflita entra
// direto, o que conflita (mesmo id, conteúdo diferente) vai pro modal de resolução.
export function ImportarExportar() {
  const [selecionadas, setSelecionadas] = useState(() => new Set(CATEGORIAS.map((c) => c.chave)));
  const [mensagem, setMensagem] = useState(null);
  const [importado, setImportado] = useState(false);
  const [erro, setErro] = useState(null);
  const [confirmando, setConfirmando] = useState(null); // payload aguardando confirmação de sobrescrita
  const [conflito, setConflito] = useState(null); // { resultado, conflitos }
  const [escolhas, setEscolhas] = useState({});

  const [selecionadasApagar, setSelecionadasApagar] = useState(() => new Set());
  const [confirmandoApagar, setConfirmandoApagar] = useState(false);
  const [apagado, setApagado] = useState(false);

  function alternar(chave) {
    setSelecionadas((atual) => {
      const novo = new Set(atual);
      if (novo.has(chave)) novo.delete(chave);
      else novo.add(chave);
      return novo;
    });
  }

  function alternarApagar(chave) {
    setSelecionadasApagar((atual) => {
      const novo = new Set(atual);
      if (novo.has(chave)) novo.delete(chave);
      else novo.add(chave);
      return novo;
    });
  }

  function apagar() {
    selecionadasApagar.forEach((c) => localStorageAdapter.apagarCategoria(c));
    setConfirmandoApagar(false);
    setSelecionadasApagar(new Set());
    setMensagem('Dados apagados.');
    setErro(null);
    setApagado(true);
  }

  async function exportar() {
    setErro(null);
    setMensagem(null);
    setImportado(false);
    if (selecionadas.size === 0) {
      setErro('Selecione ao menos uma categoria para exportar.');
      return;
    }
    try {
      const categorias = CATEGORIAS.map((c) => c.chave).filter((c) => selecionadas.has(c));
      const dados = {};
      categorias.forEach((cat) => Object.assign(dados, localStorageAdapter.exportarCategoria(cat)));
      await navigator.clipboard.writeText(JSON.stringify({ categorias, dados }));
      setMensagem('Dados copiados para a área de transferência.');
    } catch {
      setErro('Não foi possível copiar para a área de transferência.');
    }
  }

  async function importar() {
    setErro(null);
    setMensagem(null);
    let payload;
    try {
      const texto = await navigator.clipboard.readText();
      payload = JSON.parse(texto);
    } catch {
      setErro('Não foi possível ler a área de transferência — copie um backup exportado por aqui antes de importar.');
      return;
    }
    if (!payload || !Array.isArray(payload.categorias) || typeof payload.dados !== 'object') {
      setErro('O que está na área de transferência não é um backup válido.');
      return;
    }
    const paraSubstituir = payload.categorias.filter(
      (c) => c !== 'alimentos' && localStorageAdapter.possuiDadosDaCategoria(c),
    );
    if (paraSubstituir.length > 0) {
      setConfirmando(payload);
      return;
    }
    aplicarImportacao(payload);
  }

  function aplicarImportacao(payload) {
    setConfirmando(null);
    payload.categorias
      .filter((c) => c !== 'alimentos')
      .forEach((c) => localStorageAdapter.importarCategoria(c, payload.dados));

    if (!payload.categorias.includes('alimentos')) {
      setMensagem('Dados importados com sucesso.');
      setImportado(true);
      return;
    }

    const meus = Object.fromEntries(CHAVES_ALIMENTOS.map((k) => [k, localStorageAdapter.readJSON(k, k === 'alimentos_overrides' ? {} : [])]));
    const importados = Object.fromEntries(CHAVES_ALIMENTOS.map((k) => [k, payload.dados[k] ?? (k === 'alimentos_overrides' ? {} : [])]));
    const { resultado, conflitos } = mesclarAlimentos(meus, importados);
    if (conflitos.length === 0) {
      gravarAlimentos(resultado);
      setMensagem('Dados importados com sucesso.');
      setImportado(true);
      return;
    }
    setConflito({ resultado, conflitos });
    setEscolhas({});
  }

  function gravarAlimentos(dados) {
    CHAVES_ALIMENTOS.forEach((k) => localStorageAdapter.writeJSON(k, dados[k]));
  }

  function resolverConflitos(escolhaEmMassa) {
    const finais = { ...escolhas };
    if (escolhaEmMassa) {
      conflito.conflitos.forEach((c) => {
        finais[`${c.colecao}:${c.id}`] = escolhaEmMassa;
      });
    }
    const dados = aplicarResolucoes(conflito.resultado, conflito.conflitos, new Map(Object.entries(finais)));
    gravarAlimentos(dados);
    setConflito(null);
    setMensagem('Dados importados com sucesso.');
    setImportado(true);
  }

  const todasResolvidas = conflito && conflito.conflitos.every((c) => escolhas[`${c.colecao}:${c.id}`]);

  return (
    <div className="pb-5">
      <h1 className="h5 mb-3">Importar / Exportar dados</h1>
      <p className="text-muted small">
        Solução temporária enquanto o app não salva tudo num servidor. Marque o que exportar; a
        importação lê sozinha o que estiver na área de transferência.
      </p>

      <Form.Group className="mb-3 d-flex gap-3 flex-wrap">
        {CATEGORIAS.map((c) => (
          <Form.Check
            key={c.chave}
            type="checkbox"
            id={`cat-${c.chave}`}
            label={c.titulo}
            checked={selecionadas.has(c.chave)}
            onChange={() => alternar(c.chave)}
          />
        ))}
      </Form.Group>

      <div className="d-flex gap-2 mb-3">
        <Button onClick={exportar}>Exportar (copiar)</Button>
        <Button variant="outline-primary" onClick={importar}>
          Importar (da área de transferência)
        </Button>
      </div>

      {mensagem && (
        <Alert variant="success" className="py-2 small mb-2">
          {mensagem}
          {(importado || apagado) && (
            <Button size="sm" variant="success" className="ms-2" onClick={() => window.location.reload()}>
              Recarregar página
            </Button>
          )}
        </Alert>
      )}
      {erro && (
        <Alert variant="danger" className="py-2 small mb-2">
          {erro}
        </Alert>
      )}

      <hr className="my-4" />
      <h2 className="h6">Apagar dados</h2>
      <p className="text-muted small">
        Apaga permanentemente o que estiver salvo aqui neste dispositivo, por categoria. Não tem
        volta — se quiser manter uma cópia, exporte antes.
      </p>
      <Form.Group className="mb-3 d-flex gap-3 flex-wrap">
        {CATEGORIAS.map((c) => (
          <Form.Check
            key={c.chave}
            type="checkbox"
            id={`apagar-${c.chave}`}
            label={c.titulo}
            checked={selecionadasApagar.has(c.chave)}
            onChange={() => alternarApagar(c.chave)}
          />
        ))}
      </Form.Group>
      <Button
        variant="danger"
        disabled={selecionadasApagar.size === 0}
        onClick={() => setConfirmandoApagar(true)}
      >
        Apagar selecionados
      </Button>

      <Modal show={confirmandoApagar} onHide={() => setConfirmandoApagar(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Apagar dados</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Isso vai apagar permanentemente os dados de{' '}
          <strong>
            {CATEGORIAS.filter((c) => selecionadasApagar.has(c.chave))
              .map((c) => c.titulo)
              .join(', ')}
          </strong>{' '}
          salvos neste dispositivo. Essa ação não pode ser desfeita. Continuar?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setConfirmandoApagar(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={apagar}>
            Apagar
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={!!confirmando} onHide={() => setConfirmando(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Isso vai sobrescrever dados</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Já existem dados salvos aqui nas categorias sendo importadas — a importação substitui
          tudo nelas (Alimentos não: esse faz merge). Essa ação não pode ser desfeita. Continuar?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setConfirmando(null)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={() => aplicarImportacao(confirmando)}>
            Sobrescrever e importar
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={!!conflito} onHide={() => setConflito(null)} centered size="lg" scrollable>
        <Modal.Header closeButton>
          <Modal.Title>Conflitos em Alimentos</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="small text-muted">
            Esses itens existem dos dois lados com conteúdo diferente. Escolha qual versão manter
            em cada um (o resto já foi mesclado automaticamente).
          </p>
          {conflito?.conflitos.map((c) => {
            const chave = `${c.colecao}:${c.id}`;
            return (
              <div key={chave} className="border rounded p-2 mb-2">
                <div className="fw-semibold small mb-1">{rotuloConflito(c)}</div>
                <Form.Check
                  type="radio"
                  name={chave}
                  id={`${chave}-meu`}
                  label="Manter o meu"
                  checked={escolhas[chave] === 'meu'}
                  onChange={() => setEscolhas((e) => ({ ...e, [chave]: 'meu' }))}
                />
                <Form.Check
                  type="radio"
                  name={chave}
                  id={`${chave}-importado`}
                  label="Manter o importado"
                  checked={escolhas[chave] === 'importado'}
                  onChange={() => setEscolhas((e) => ({ ...e, [chave]: 'importado' }))}
                />
              </div>
            );
          })}
        </Modal.Body>
        <Modal.Footer className="d-flex flex-wrap gap-2">
          <Button variant="outline-secondary" onClick={() => resolverConflitos('meu')}>
            Manter todos os meus
          </Button>
          <Button variant="outline-secondary" onClick={() => resolverConflitos('importado')}>
            Manter todos os importados
          </Button>
          <Button disabled={!todasResolvidas} onClick={() => resolverConflitos(null)}>
            Aplicar escolhas
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
