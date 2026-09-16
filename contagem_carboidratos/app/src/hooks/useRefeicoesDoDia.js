import { useCallback, useEffect, useState } from 'react';
import { refeicoesDoDiaRepository } from '../data/repositories/refeicoesDoDiaRepository';
import { gerarId } from '../lib/id';

// Garante que a refeição-alvo exista na lista antes de mutá-la. Se não existir (é uma
// refeição do plano ainda só exibida na tela, nunca lançada nesse dia), cria com base em
// `criarSeNaoExistir` ({ tipo, horario }) — sem isso, quem chama já sabe que a refeição
// existe de verdade (ex: id vindo de um item que já está na lista).
function comRefeicaoGarantida(refeicoesAtuais, refeicaoId, criarSeNaoExistir) {
  if (refeicoesAtuais.some((r) => r.id === refeicaoId)) {
    return { refeicoes: refeicoesAtuais, id: refeicaoId };
  }
  const novaId = gerarId('ref');
  const nova = {
    id: novaId,
    tipo: criarSeNaoExistir.tipo,
    horario: criarSeNaoExistir.horario,
    horarioRegistrado: null,
    itens: [],
  };
  return { refeicoes: [...refeicoesAtuais, nova], id: novaId };
}

export function useRefeicoesDoDia(data) {
  const [diaRegistro, setDiaRegistro] = useState({ data, refeicoes: [] });
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let cancelado = false;
    setCarregando(true);
    refeicoesDoDiaRepository.getByData(data).then((dados) => {
      if (!cancelado) {
        setDiaRegistro(dados);
        setCarregando(false);
      }
    });
    return () => {
      cancelado = true;
    };
  }, [data]);

  // Ponto único de gravação: nunca guarda uma refeição vazia (sem itens) que também não
  // tenha um horário registrado — é assim que "remover tudo" de uma refeição some dela do
  // armazenamento desse dia, voltando a ser só a exibição virtual vinda do plano. Não existe
  // mais criação antecipada de refeições vazias "só por existir".
  const persistir = useCallback(async (novoDia) => {
    const diaLimpo = {
      ...novoDia,
      refeicoes: novoDia.refeicoes.filter((r) => r.itens.length > 0 || r.horarioRegistrado),
    };
    setDiaRegistro(diaLimpo);
    await refeicoesDoDiaRepository.salvar(diaLimpo);
  }, []);

  const editarRefeicao = useCallback(
    (refeicaoId, dados, criarSeNaoExistir) => {
      const { refeicoes, id } = comRefeicaoGarantida(diaRegistro.refeicoes, refeicaoId, criarSeNaoExistir);
      return persistir({
        ...diaRegistro,
        refeicoes: refeicoes.map((r) => (r.id === id ? { ...r, ...dados } : r)),
      });
    },
    [diaRegistro, persistir],
  );

  const adicionarItens = useCallback(
    (refeicaoId, novosItens, criarSeNaoExistir) => {
      const comId = novosItens.map((item) => ({ id: gerarId('item'), ...item }));
      const { refeicoes, id } = comRefeicaoGarantida(diaRegistro.refeicoes, refeicaoId, criarSeNaoExistir);
      return persistir({
        ...diaRegistro,
        refeicoes: refeicoes.map((r) => (r.id === id ? { ...r, itens: [...r.itens, ...comId] } : r)),
      });
    },
    [diaRegistro, persistir],
  );

  const adicionarItem = useCallback(
    (refeicaoId, alimentoId, quantidadeG, origem = 'extra', criarSeNaoExistir) =>
      adicionarItens(refeicaoId, [{ alimentoId, quantidadeG, origem }], criarSeNaoExistir),
    [adicionarItens],
  );

  const removerItem = useCallback(
    (refeicaoId, itemId) => {
      return persistir({
        ...diaRegistro,
        refeicoes: diaRegistro.refeicoes.map((r) =>
          r.id === refeicaoId ? { ...r, itens: r.itens.filter((i) => i.id !== itemId) } : r,
        ),
      });
    },
    [diaRegistro, persistir],
  );

  const editarQuantidadeItem = useCallback(
    (refeicaoId, itemId, quantidadeG) => {
      return persistir({
        ...diaRegistro,
        refeicoes: diaRegistro.refeicoes.map((r) =>
          r.id === refeicaoId
            ? { ...r, itens: r.itens.map((i) => (i.id === itemId ? { ...i, quantidadeG } : i)) }
            : r,
        ),
      });
    },
    [diaRegistro, persistir],
  );

  // Usado pela Sugestão de Substituição (embutida na própria refeição do dia): remove os
  // itens indicados (por id de item, não de alimento — cada linha lançada é tratada por si)
  // e adiciona os novos, em uma única gravação. `idsParaRemover` vazio = só soma por cima,
  // sem tirar nada. A refeição pode ainda não existir de verdade (um item do plano nunca
  // lançado) — `criarSeNaoExistir` cria nesse caso.
  const substituirItensNaRefeicao = useCallback(
    (refeicaoId, idsParaRemover, novosItens, criarSeNaoExistir) => {
      const comId = novosItens.map((item) => ({
        id: gerarId('item'),
        origem: 'substituicao',
        ...item,
      }));
      const { refeicoes, id } = comRefeicaoGarantida(diaRegistro.refeicoes, refeicaoId, criarSeNaoExistir);
      return persistir({
        ...diaRegistro,
        refeicoes: refeicoes.map((r) => {
          if (r.id !== id) return r;
          const itensFiltrados = idsParaRemover.length
            ? r.itens.filter((i) => !idsParaRemover.includes(i.id))
            : r.itens;
          return { ...r, itens: [...itensFiltrados, ...comId] };
        }),
      });
    },
    [diaRegistro, persistir],
  );

  return {
    diaRegistro,
    carregando,
    editarRefeicao,
    adicionarItem,
    adicionarItens,
    removerItem,
    editarQuantidadeItem,
    substituirItensNaRefeicao,
  };
}
