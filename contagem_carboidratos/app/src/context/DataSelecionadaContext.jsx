import { createContext, useContext, useMemo, useState } from 'react';
import { dataLocalISO, somarDias } from '../lib/data';

const DataSelecionadaContext = createContext(null);

// Data "atual" compartilhada entre a tela de Refeições do Dia e a Sugestão de Substituição
// (embutida no Plano) — aplicar uma substituição sempre afeta a refeição do dia que está
// selecionado aqui, sempre abrindo em hoje.
export function DataSelecionadaProvider({ children }) {
  const [data, setData] = useState(dataLocalISO());

  const valor = useMemo(
    () => ({
      data,
      setData,
      irParaHoje: () => setData(dataLocalISO()),
      mudarDia: (delta) => setData((atual) => somarDias(atual, delta)),
      ehHoje: data === dataLocalISO(),
    }),
    [data],
  );

  return (
    <DataSelecionadaContext.Provider value={valor}>{children}</DataSelecionadaContext.Provider>
  );
}

export function useDataSelecionada() {
  const contexto = useContext(DataSelecionadaContext);
  if (!contexto) {
    throw new Error('useDataSelecionada precisa estar dentro de DataSelecionadaProvider');
  }
  return contexto;
}
