import { useState } from 'react';
import { Collapse } from 'react-bootstrap';

// Um bloco de conteúdo com cabeçalho clicável (título + quantidade entre parênteses + chevron)
// que abre/fecha — usado dentro de `RefeicaoDoDiaCard` para as sub-seções "Usados recentemente"
// e "Sugestões do plano", que antes ficavam sempre abertas competindo por espaço com o resto do
// card. Cabeçalho com fundo/borda cinza (`.subsecao-cabecalho`, mesmas cores da `.subsecao` que
// já isola listas secundárias do card branco por trás) em vez de só texto — precisa parecer um
// controle de verdade, não uma legenda, senão nada sugere que dá pra clicar ali.
export function SecaoColapsavel({ titulo, quantidade, children, defaultAberto = false }) {
  const [aberto, setAberto] = useState(defaultAberto);

  function alternar() {
    setAberto((atual) => !atual);
  }

  return (
    <div className="mb-3">
      <div
        className="d-flex justify-content-between align-items-center subsecao-cabecalho rounded px-3 py-2"
        role="button"
        tabIndex={0}
        onClick={alternar}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            alternar();
          }
        }}
        aria-expanded={aberto}
      >
        <span className="fw-semibold">
          {titulo} <span className="text-muted fw-normal">({quantidade})</span>
        </span>
        <span className="chevron-colapso" aria-hidden="true">
          {aberto ? '▾' : '▸'}
        </span>
      </div>
      <Collapse in={aberto}>
        <div className="mt-2">{children}</div>
      </Collapse>
    </div>
  );
}
