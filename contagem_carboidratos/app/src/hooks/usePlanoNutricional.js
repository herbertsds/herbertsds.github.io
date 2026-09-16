import { useCallback, useEffect, useState } from 'react';
import { planoNutricionalRepository } from '../data/repositories/planoNutricionalRepository';
import { gerarId } from '../lib/id';

export function usePlanoNutricional() {
  const [plano, setPlano] = useState({ refeicoes: [] });
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let cancelado = false;
    planoNutricionalRepository.get().then((dados) => {
      if (!cancelado) {
        setPlano(dados);
        setCarregando(false);
      }
    });
    return () => {
      cancelado = true;
    };
  }, []);

  const persistir = useCallback(async (novoPlano) => {
    setPlano(novoPlano);
    await planoNutricionalRepository.salvar(novoPlano);
  }, []);

  const adicionarRefeicao = useCallback(
    (tipo, horario) => {
      const novaRefeicao = { id: gerarId('ref'), tipo, horario, itens: [] };
      return persistir({ refeicoes: [...plano.refeicoes, novaRefeicao] });
    },
    [plano, persistir],
  );

  const editarRefeicao = useCallback(
    (refeicaoId, dados) => {
      return persistir({
        refeicoes: plano.refeicoes.map((r) => (r.id === refeicaoId ? { ...r, ...dados } : r)),
      });
    },
    [plano, persistir],
  );

  const excluirRefeicao = useCallback(
    (refeicaoId) => {
      return persistir({
        refeicoes: plano.refeicoes.filter((r) => r.id !== refeicaoId),
      });
    },
    [plano, persistir],
  );

  // Devolve o id do item de forma síncrona — quem chama usa pra destacar/rolar até ele.
  const adicionarItem = useCallback(
    (refeicaoId, alimentoId, quantidadeG) => {
      const novoId = gerarId('item');
      persistir({
        refeicoes: plano.refeicoes.map((r) =>
          r.id === refeicaoId ? { ...r, itens: [...r.itens, { id: novoId, alimentoId, quantidadeG }] } : r,
        ),
      });
      return novoId;
    },
    [plano, persistir],
  );

  const removerItem = useCallback(
    (refeicaoId, itemId) => {
      return persistir({
        refeicoes: plano.refeicoes.map((r) =>
          r.id === refeicaoId ? { ...r, itens: r.itens.filter((i) => i.id !== itemId) } : r,
        ),
      });
    },
    [plano, persistir],
  );

  const editarQuantidadeItem = useCallback(
    (refeicaoId, itemId, quantidadeG) => {
      return persistir({
        refeicoes: plano.refeicoes.map((r) =>
          r.id === refeicaoId
            ? { ...r, itens: r.itens.map((i) => (i.id === itemId ? { ...i, quantidadeG } : i)) }
            : r,
        ),
      });
    },
    [plano, persistir],
  );

  return {
    plano,
    carregando,
    adicionarRefeicao,
    editarRefeicao,
    excluirRefeicao,
    adicionarItem,
    removerItem,
    editarQuantidadeItem,
  };
}
