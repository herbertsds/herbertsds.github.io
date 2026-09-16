import { useCallback, useEffect, useMemo, useState } from 'react';
import { alimentosRepository } from '../data/repositories/alimentosRepository';

// `alimentos` = disponíveis (sem os customizados excluídos) — o que se usa pra buscar algo
// novo pra adicionar numa refeição. `todos` = catálogo inteiro, inclusive excluídos — usado
// pra montar o Map de busca por id (alimentosPorId), porque uma refeição já lançada não pode
// "perder" o nome/valores de um alimento só porque ele foi excluído da lista depois.
export function useAlimentos() {
  const [todos, setTodos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const recarregar = useCallback(() => {
    setCarregando(true);
    return alimentosRepository
      .getAll()
      .then((dados) => setTodos(dados))
      .catch((err) => setErro(err))
      .finally(() => setCarregando(false));
  }, []);

  useEffect(() => {
    recarregar();
  }, [recarregar]);

  const alimentos = useMemo(() => todos.filter((a) => !a.excluido && !a._variacao), [todos]);

  return { alimentos, todos, carregando, erro, recarregar };
}
