import { useEffect, useRef, useState } from 'react';
import { DataSelecionadaProvider } from './context/DataSelecionadaContext';
import { usePlanoNutricional } from './hooks/usePlanoNutricional';
import { PlanoNutricional } from './pages/PlanoNutricional';
import { RefeicoesDoDia } from './pages/RefeicoesDoDia';
import { Alimentos } from './pages/Alimentos';
import { ImportarExportar } from './pages/ImportarExportar';
import { InfoFonteDadosModal } from './components/InfoFonteDadosModal';

const ABAS = [
  { chave: 'hoje', rotulo: 'Refeições', Componente: RefeicoesDoDia },
  { chave: 'plano', rotulo: 'Plano', Componente: PlanoNutricional },
  { chave: 'alimentos', rotulo: 'Alimentos', Componente: Alimentos },
  { chave: 'backup', rotulo: 'Backup', Componente: ImportarExportar },
];

export default function App() {
  const [abaAtiva, setAbaAtiva] = useState('hoje');
  const [infoAberta, setInfoAberta] = useState(false);
  const definiuAbaInicial = useRef(false);
  const { plano, carregando } = usePlanoNutricional();

  // Hoje é a tela principal. No primeiro acesso (sem plano cadastrado ainda), abre direto
  // no Plano Nutricional, que mostra a chamada para cadastrar o que foi receitado pela
  // nutricionista — sem plano, não faz sentido nem tem o que lançar em Hoje.
  useEffect(() => {
    if (!carregando && !definiuAbaInicial.current) {
      definiuAbaInicial.current = true;
      if (plano.refeicoes.length === 0) {
        setAbaAtiva('plano');
      }
    }
  }, [carregando, plano]);

  const AbaAtual = ABAS.find((aba) => aba.chave === abaAtiva)?.Componente ?? RefeicoesDoDia;

  return (
    <DataSelecionadaProvider>
      <div className="app-shell">
        <header className="app-header d-flex align-items-center gap-2">
          <h1 className="h6 mb-0">Contagem de Carboidratos</h1>
          <button
            type="button"
            className="botao-info"
            aria-label="Sobre os dados de alimentos"
            onClick={() => setInfoAberta(true)}
          >
            ⓘ
          </button>
        </header>

        <main className="app-conteudo">
          <div className="app-conteudo-interno container-fluid px-3 py-3">
            <AbaAtual />
          </div>
        </main>

        <nav className="app-nav-inferior">
          {ABAS.map((aba) => (
            <button
              key={aba.chave}
              type="button"
              className={`nav-item ${abaAtiva === aba.chave ? 'ativo' : ''}`}
              onClick={() => setAbaAtiva(aba.chave)}
            >
              {aba.rotulo}
            </button>
          ))}
        </nav>

        <InfoFonteDadosModal aberto={infoAberta} onFechar={() => setInfoAberta(false)} />
      </div>
    </DataSelecionadaProvider>
  );
}
