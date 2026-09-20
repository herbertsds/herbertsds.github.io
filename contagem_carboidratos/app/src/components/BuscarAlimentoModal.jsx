import { useMemo, useState } from 'react';
import { Modal, Form } from 'react-bootstrap';
import { buscarAlimentos } from '../domain/busca';
import { classificarCandidato, filtrarEOrdenarCandidatos } from '../domain/substituicao';
import { ListaPaginada } from './ListaPaginada';
import { CandidatoOrcamentoItem } from './CandidatoOrcamentoItem';
import { FiltroOrdenacaoCandidatos } from './FiltroOrdenacaoCandidatos';
import { AlimentoQuantidadeModal } from './AlimentoQuantidadeModal';
import { fecharTecladoNoEnter } from '../utils/teclado';

const SEM_USO = { kcal: 0, cho: 0 };

// Fluxo de adicionar um alimento numa refeição do dia, em dois passos dentro do mesmo botão
// "+ Adicionar alimento" (ver RefeicaoDoDiaCard.jsx): primeiro esse modal de busca — campo de
// busca, filtro/ordenação e a lista de candidatos numa lista única (cabe ou não cabe mais no
// que resta da meta, mesma lógica de classificação da Sugestão de Substituição —
// `classificarCandidato` — só que comparando contra o restante da própria refeição, não uma
// cesta); ao escolher um item, esse modal fecha e abre o `AlimentoQuantidadeModal` — **sempre**,
// tenha o alimento variação cadastrada ou não (antes só abria quando tinha variação; virou
// padrão único pra não ter dois comportamentos diferentes dependendo do alimento clicado).
// Cabe ao alimento decidir se mostra ou não o seletor de variação — ele já sabe fazer isso
// sozinho quando `variacoes` vem vazio.
export function BuscarAlimentoModal({
  aberto,
  onFechar,
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

  function fecharTudo() {
    setConsulta('');
    setCandidatoEmEscolha(null);
    onFechar();
  }

  return (
    <>
      <Modal show={aberto && !candidatoEmEscolha} onHide={fecharTudo} centered scrollable>
        <Modal.Header closeButton>
          <Modal.Title>Adicionar alimento</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Control
            className="mb-2"
            placeholder="Buscar alimento..."
            value={consulta}
            onChange={(e) => setConsulta(e.target.value)}
            autoFocus
            enterKeyHint="search"
            onKeyDown={fecharTecladoNoEnter}
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
                onSelecionar={(alimento, quantidade) => setCandidatoEmEscolha({ alimento, quantidade })}
              />
            )}
          />
        </Modal.Body>
      </Modal>

      <AlimentoQuantidadeModal
        alimento={candidatoEmEscolha?.alimento}
        variacoes={variacoesPorBase?.get(candidatoEmEscolha?.alimento?.id) ?? []}
        permitirVariacoes
        quantidadeInicial={candidatoEmEscolha?.quantidade}
        orcamento={orcamentoRestante}
        usoOutros={SEM_USO}
        respeitarCalorias={respeitarCalorias}
        respeitarCarboidratos={respeitarCarboidratos}
        aberto={aberto && !!candidatoEmEscolha}
        onFechar={() => setCandidatoEmEscolha(null)}
        onConfirmar={(alimentoId, quantidade) => {
          onAdicionar(alimentoId, quantidade);
          fecharTudo();
        }}
      />
    </>
  );
}
