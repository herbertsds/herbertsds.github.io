import { useEffect, useState } from 'react';
import { refeicoesDoDiaRepository } from '../data/repositories/refeicoesDoDiaRepository';

const DIAS_PADRAO = 15;

// Os dias imediatamente anteriores à data selecionada (não inclui ela mesma — essa já vem de
// `useRefeicoesDoDia`) — usado só para sugerir, em cada refeição de `RefeicoesDoDia.jsx`,
// alimentos usados recentemente nessa mesma refeição (ver `domain/historico.js`).
export function useHistoricoRefeicoes(data, dias = DIAS_PADRAO) {
  const [diasAnteriores, setDiasAnteriores] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let cancelado = false;
    setCarregando(true);
    refeicoesDoDiaRepository.getUltimosDias(data, dias).then((resultado) => {
      if (!cancelado) {
        setDiasAnteriores(resultado);
        setCarregando(false);
      }
    });
    return () => {
      cancelado = true;
    };
  }, [data, dias]);

  return { diasAnteriores, carregando };
}
