import { useState } from 'react';
import { Button } from 'react-bootstrap';
import { RefeicaoCard } from './RefeicaoCard';
import { BuscarAlimentoModal } from './BuscarAlimentoModal';

// Uma refeição do Plano Nutricional, renderizada dentro de `PlanoNutricional.jsx`. Existe como
// componente à parte (em vez de um bloco JSX montado dentro do `.map()` da página) só por causa
// do estado `buscaAberta` — hooks não podem ser chamados dentro de um `.map()` (mesmo motivo de
// `RefeicaoDoDiaCard.jsx`). Sem "respeitar calorias/carboidratos", sugestões do plano ou
// substituição — nada disso existe no Plano, só em Refeições do Dia. Por isso o
// `BuscarAlimentoModal` aqui não recebe `orcamentoRestante`/`respeitarCalorias`/
// `respeitarCarboidratos`: sem eles, a lista de candidatos não classifica "cabe/excede" (o
// Plano não tem meta vs. consumido, ele É a meta) e nenhuma variação de marca é oferecida (só
// existe seletor de variação em Refeições do Dia, nunca aqui).
export function RefeicaoPlanoCard({
  refeicao,
  alimentos,
  alimentosPorId,
  recemAdicionadoId,
  onAdicionarItem,
  onRemoverItem,
  onEditarQuantidadeItem,
  onEditar,
  onExcluir,
  resumo,
}) {
  const [buscaAberta, setBuscaAberta] = useState(false);

  return (
    <>
      <RefeicaoCard
        refeicao={refeicao}
        alimentos={alimentos}
        alimentosPorId={alimentosPorId}
        onAdicionarItem={onAdicionarItem}
        onRemoverItem={onRemoverItem}
        onEditarQuantidadeItem={onEditarQuantidadeItem}
        recemAdicionadoId={recemAdicionadoId}
        colapsavel
        ocultarBuscaLivre
        resumo={resumo}
        onEditar={onEditar}
        onExcluir={onExcluir}
        rodape={
          <Button variant="primary" size="lg" className="w-100 mt-2" onClick={() => setBuscaAberta(true)}>
            + Adicionar alimento
          </Button>
        }
      />

      <BuscarAlimentoModal
        aberto={buscaAberta}
        onFechar={() => setBuscaAberta(false)}
        alimentos={alimentos}
        onAdicionar={onAdicionarItem}
      />
    </>
  );
}
