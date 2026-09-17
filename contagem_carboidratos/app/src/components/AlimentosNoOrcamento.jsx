import { useMemo, useState } from 'react';
import { Form } from 'react-bootstrap';
import { buscarAlimentos } from '../domain/busca';
import { classificarCandidato, filtrarEOrdenarCandidatos } from '../domain/substituicao';
import { ListaPaginada } from './ListaPaginada';
import { CandidatoOrcamentoItem } from './CandidatoOrcamentoItem';
import { FiltroOrdenacaoCandidatos } from './FiltroOrdenacaoCandidatos';
import { AlimentoQuantidadeModal } from './AlimentoQuantidadeModal';

const SEM_USO = { kcal: 0, cho: 0 };

// Ajuda a escolher o que adicionar direto numa refeição do dia, numa lista única (cabe ou
// não cabe mais no que resta da meta) — mesma lógica de classificação usada na Sugestão de
// Substituição (`classificarCandidato`), mas comparando contra o restante da própria refeição
// (meta menos o que já foi consumido), não uma cesta. Clicar num item sem variação cadastrada
// adiciona direto na refeição, na medida usual, do mesmo jeito que as sugestões do plano —
// inclusive os que ultrapassam: a escolha de estourar ou não a meta é do usuário, não do app,
// então não faz sentido bloquear o clique, só deixar o aviso bem claro (ver
// `CandidatoOrcamentoItem`). Quando o alimento TEM variação cadastrada (`variacoesPorBase`),
// o clique abre o `AlimentoQuantidadeModal` em vez de adicionar direto — é o único jeito de
// escolher a marca antes de lançar (bug real: antes dessa checagem, não existia NENHUM jeito
// de escolher uma variação ao adicionar algo no Dia, porque este é o caminho principal de
// busca/adição, e o outro lugar que sabia mostrar o seletor de variação — a busca livre dentro
// de `RefeicaoCard` — está sempre oculto via `ocultarBuscaLivre`). Os toggles Respeitar
// calorias/carboidratos são controlados por quem usa este componente (aparecem logo depois da
// Meta da Refeição, não aqui). É também o único jeito de buscar e adicionar um alimento no Dia
// — a busca livre do topo do card some quando esse componente está presente, pra não ter dois
// campos de busca fazendo a mesma coisa.
export function AlimentosNoOrcamento({
  alimentos,
  variacoesPorBase,
  orcamentoRestante,
  respeitarCalorias,
  respeitarCarboidratos,
  onAdicionar,
}) {
  const [consulta, setConsulta] = useState('');
  const [filtro, setFiltro] = useState('todos');
  const [ordenarPor, setOrdenarPor] = useState(null);
  const [direcao, setDirecao] = useState('asc');
  const [candidatoEmEscolha, setCandidatoEmEscolha] = useState(null); // { alimento, quantidade }

  const candidatos = useMemo(() => {
    const filtrados = buscarAlimentos(alimentos, consulta, alimentos.length);
    const classificados = filtrados.map((alimento) =>
      classificarCandidato(alimento, SEM_USO, orcamentoRestante, {
        calorias: respeitarCalorias,
        carboidratos: respeitarCarboidratos,
      }),
    );
    return filtrarEOrdenarCandidatos(classificados, { filtro, ordenarPor, direcao });
  }, [alimentos, consulta, orcamentoRestante, respeitarCalorias, respeitarCarboidratos, filtro, ordenarPor, direcao]);

  return (
    <div className="mt-3">
      <div className="small text-muted mb-1">Adicione novos alimentos na sua refeição:</div>
      <Form.Control
        className="mb-2"
        placeholder="Buscar alimento..."
        value={consulta}
        onChange={(e) => setConsulta(e.target.value)}
      />
      <FiltroOrdenacaoCandidatos
        filtro={filtro}
        onFiltroChange={setFiltro}
        ordenarPor={ordenarPor}
        onOrdenarPorChange={setOrdenarPor}
        direcao={direcao}
        onDirecaoChange={setDirecao}
      />
      <ListaPaginada
        itens={candidatos}
        itensPorPagina={5}
        resetKey={`${consulta}|${filtro}|${ordenarPor}|${direcao}`}
        renderItem={(c) => (
          <CandidatoOrcamentoItem
            key={c.alimento.id}
            candidato={c}
            onSelecionar={(alimento, quantidade) => {
              const temVariacoes = (variacoesPorBase?.get(alimento.id) ?? []).length > 0;
              if (temVariacoes) {
                setCandidatoEmEscolha({ alimento, quantidade });
                return;
              }
              onAdicionar(alimento.id, quantidade);
              setConsulta('');
            }}
          />
        )}
      />

      <AlimentoQuantidadeModal
        alimento={candidatoEmEscolha?.alimento}
        variacoes={variacoesPorBase?.get(candidatoEmEscolha?.alimento?.id) ?? []}
        permitirVariacoes
        quantidadeInicial={candidatoEmEscolha?.quantidade}
        aberto={!!candidatoEmEscolha}
        onFechar={() => setCandidatoEmEscolha(null)}
        onConfirmar={(alimentoId, quantidade) => {
          onAdicionar(alimentoId, quantidade);
          setConsulta('');
        }}
      />
    </div>
  );
}
