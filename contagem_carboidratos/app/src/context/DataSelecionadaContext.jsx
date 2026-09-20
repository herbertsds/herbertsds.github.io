import { createContext, useContext, useMemo, useState } from 'react';
import { dataLocalISO } from '../lib/data';

const DataSelecionadaContext = createContext(null);

function somarDias(dataISO, delta) {
  const [ano, mes, dia] = dataISO.split('-').map(Number);
  const data = new Date(ano, mes - 1, dia + delta);
  const y = data.getFullYear();
  const m = String(data.getMonth() + 1).padStart(2, '0');
  const d = String(data.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

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
