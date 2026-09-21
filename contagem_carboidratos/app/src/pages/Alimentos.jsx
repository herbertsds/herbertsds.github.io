import { useMemo, useState } from 'react';
import { Form, Spinner, Alert, Button, Badge } from 'react-bootstrap';
import { useAlimentos } from '../hooks/useAlimentos';
import { AlimentoFormModal } from '../components/AlimentoFormModal';
import { AlimentoVariacoesModal } from '../components/AlimentoVariacoesModal';
import { ListaPaginada } from '../components/ListaPaginada';
import { alimentosRepository } from '../data/repositories/alimentosRepository';
import { buscarAlimentos } from '../domain/busca';
import { formatarNumero } from '../domain/calculos';
import { fecharTecladoNoEnter } from '../utils/teclado';

function linhaResumo(alimento) {
  return `${alimento.medida} (${
    alimento.quantidade_indefinida ? 'sem peso definido' : `${formatarNumero(alimento.quantidade_g_ml)} g`
  }) · ${Math.round(alimento.calorias_kcal)} kcal · ${formatarNumero(alimento.carboidratos_g)} g CHO`;
}

const FILTROS = [
  { chave: 'editado', rotulo: 'Editados' },
  { chave: 'adicionado', rotulo: 'Adicionados' },
  { chave: 'comVariacoes', rotulo: 'Com variações' },
];

// Tela para corrigir dados do catálogo, cadastrar alimentos que não estão nele, e gerenciar
// variações de marca de qualquer um dos dois.
export function Alimentos() {
  const { alimentos, todos, carregando, recarregar } = useAlimentos();
  const [consulta, setConsulta] = useState('');
  // Conjunto de filtros ligados ('editado' | 'adicionado' | 'comVariacoes') — vazio = ver
  // tudo; um ou mais ligados = OU lógico entre eles (ex: "editado" + "adicionado" ligados
  // mostra os dois juntos, não a interseção). Editados e adicionados voltaram a viver na MESMA
  // lista — antes "Meus alimentos" era uma seção à parte, sem busca nem filtro; agora é tudo
  // uma coisa só, com os badges (`editado`/`adicionado`) marcando cada item.
  const [filtrosAtivos, setFiltrosAtivos] = useState(() => new Set());
  const [editando, setEditando] = useState(null);
  const [criando, setCriando] = useState(false);
  const [gerenciandoVariacoes, setGerenciandoVariacoes] = useState(null);
  const [mensagem, setMensagem] = useState(null);

  const contagemVariacoesPorBase = useMemo(() => {
    const mapa = new Map();
    for (const a of todos) {
      if (a._variacao && !a.excluido) {
        mapa.set(a.alimentoBaseId, (mapa.get(a.alimentoBaseId) ?? 0) + 1);
      }
    }
    return mapa;
  }, [todos]);

  // A busca roda sobre a lista inteira (sem limite arbitrário) e o filtro por
  // editado/adicionado/com variações é aplicado em cima do resultado inteiro da busca, antes
  // de paginar — assim o filtro nunca perde item por causa de um corte anterior.
  const resultados = useMemo(() => {
    const buscados = buscarAlimentos(alimentos, consulta, alimentos.length);
    if (filtrosAtivos.size === 0) return buscados;
    return buscados.filter(
      (a) =>
        (filtrosAtivos.has('editado') && a._editado) ||
        (filtrosAtivos.has('adicionado') && a._adicionado) ||
        (filtrosAtivos.has('comVariacoes') && contagemVariacoesPorBase.get(a.id) > 0),
    );
  }, [alimentos, consulta, filtrosAtivos, contagemVariacoesPorBase]);

  const variacoesDoGerenciado = useMemo(
    () =>
      gerenciandoVariacoes
        ? todos.filter((a) => a._variacao && a.alimentoBaseId === gerenciandoVariacoes.id && !a.excluido)
        : [],
    [todos, gerenciandoVariacoes],
  );

  function alternarFiltro(chave) {
    setFiltrosAtivos((atual) => {
      const novo = new Set(atual);
      if (novo.has(chave)) novo.delete(chave);
      else novo.add(chave);
      return novo;
    });
  }

  async function salvarEdicao(dados) {
    // Um "adicionado" (custom) não passa pela camada de overrides — o registro dele já é
    // editável direto, overrides só fazem sentido em cima do catálogo estático do JSON.
    if (editando._adicionado) {
      await alimentosRepository.atualizarCustomizado(editando.id, dados);
    } else {
      await alimentosRepository.salvarEdicao(editando.id, dados);
    }
    await recarregar();
    setMensagem(`"${editando.alimento}" atualizado.`);
  }

  async function reverterEdicao(alimento) {
    await alimentosRepository.removerEdicao(alimento.id);
    await recarregar();
    setMensagem(`Edição de "${alimento.alimento}" desfeita — voltou ao valor original.`);
  }

  async function criarAlimento(dados) {
    await alimentosRepository.adicionarCustomizado(dados);
    await recarregar();
    setMensagem(`"${dados.alimento}" adicionado ao catálogo.`);
  }

  async function excluirCustomizado(alimento) {
    await alimentosRepository.excluirCustomizado(alimento.id);
    await recarregar();
    setMensagem(`"${alimento.alimento}" removido da lista (refeições que já usam ele continuam normais).`);
  }

  async function criarVariacao(dados) {
    await alimentosRepository.criarVariacao(gerenciandoVariacoes.id, dados);
    await recarregar();
    setMensagem(`Variação "${dados.nomeVariacao}" adicionada a "${gerenciandoVariacoes.alimento}".`);
  }

  async function excluirVariacao(variacaoId) {
    await alimentosRepository.excluirVariacao(variacaoId);
    await recarregar();
  }

  if (carregando) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <div className="pb-5">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h1 className="h5 mb-0">Alimentos</h1>
        <Button size="sm" onClick={() => setCriando(true)}>
          + Alimento
        </Button>
      </div>
      <p className="text-muted small">
        Corrija a medida, o peso ou os valores de calorias/carboidratos de um alimento do
        catálogo, cadastre um que não existe nele, ou crie variações de marca (ex: um pão de
        forma integral pode ter uma variação "Vigor" e outra "Panco", cada uma com seus
        próprios valores).
      </p>

      {mensagem && (
        <Alert variant="success" className="py-1 small" onClose={() => setMensagem(null)} dismissible>
          {mensagem}
        </Alert>
      )}

      <Form.Control
        className="mb-2"
        placeholder="Buscar alimento para editar..."
        value={consulta}
        onChange={(e) => setConsulta(e.target.value)}
        enterKeyHint="search"
        onKeyDown={fecharTecladoNoEnter}
      />
      <div className="d-flex gap-3 flex-wrap mb-3">
        {FILTROS.map(({ chave, rotulo }) => (
          <Form.Check
            key={chave}
            type="checkbox"
            id={`filtro-${chave}`}
            label={rotulo}
            checked={filtrosAtivos.has(chave)}
            onChange={() => alternarFiltro(chave)}
          />
        ))}
      </div>

      <ListaPaginada
        itens={resultados}
        itensPorPagina={10}
        resetKey={`${consulta}|${[...filtrosAtivos].sort().join(',')}`}
        renderItem={(alimento) => (
          <div key={alimento.id} className="item-alimento-editavel d-flex justify-content-between align-items-start gap-2">
            <div>
              <div>
                {alimento.alimento}{' '}
                {alimento._adicionado && <Badge bg="primary">adicionado</Badge>}{' '}
                {alimento._editado && (
                  <Badge bg="warning" text="dark">
                    editado
                  </Badge>
                )}
              </div>
              <small className="text-muted">{linhaResumo(alimento)}</small>
              {contagemVariacoesPorBase.get(alimento.id) > 0 && (
                <small className="text-muted d-block">
                  {contagemVariacoesPorBase.get(alimento.id)} variação(ões)
                </small>
              )}
            </div>
            <div className="d-flex flex-column gap-1 align-items-end">
              <Button
                size="sm"
                variant="outline-secondary"
                className="btn-largura-fixa"
                onClick={() => setEditando(alimento)}
              >
                Editar
              </Button>
              <Button
                size="sm"
                variant="outline-primary"
                className="btn-largura-fixa"
                onClick={() => setGerenciandoVariacoes(alimento)}
              >
                Variações
              </Button>
              {alimento._adicionado && (
                <Button size="sm" variant="outline-danger" onClick={() => excluirCustomizado(alimento)}>
                  Excluir
                </Button>
              )}
              {alimento._editado && (
                <Button
                  size="sm"
                  variant="outline-danger"
                  className="btn-largura-fixa"
                  onClick={() => reverterEdicao(alimento)}
                >
                  Reverter edição
                </Button>
              )}
            </div>
          </div>
        )}
      />

      <AlimentoFormModal
        modo="editar"
        alimento={editando}
        aberto={!!editando}
        onFechar={() => setEditando(null)}
        onSalvar={salvarEdicao}
      />
      <AlimentoFormModal
        modo="criar"
        alimento={null}
        aberto={criando}
        onFechar={() => setCriando(false)}
        onSalvar={criarAlimento}
      />
      <AlimentoVariacoesModal
        alimentoBase={gerenciandoVariacoes}
        variacoes={variacoesDoGerenciado}
        aberto={!!gerenciandoVariacoes}
        onFechar={() => setGerenciandoVariacoes(null)}
        onCriar={criarVariacao}
        onExcluir={excluirVariacao}
      />
    </div>
  );
}
