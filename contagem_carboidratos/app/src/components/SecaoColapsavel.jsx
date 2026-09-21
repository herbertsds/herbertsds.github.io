import { useState } from 'react';
import { Collapse } from 'react-bootstrap';

// Um bloco de conteúdo com cabeçalho clicável (título + quantidade entre parênteses + chevron)
// que abre/fecha — usado dentro de `RefeicaoDoDiaCard` para as sub-seções "Sugestões do plano"
// e "Usados recentemente", que antes ficavam sempre abertas competindo por espaço com o resto
// do card. Mesmas classes (`card-header-colapsavel`/`chevron-colapso`) do cabeçalho colapsável
// do `RefeicaoCard`, só que num bloco menor em vez do `Card.Header` inteiro.
export function SecaoColapsavel({ titulo, quantidade, children, defaultAberto = false }) {
  const [aberto, setAberto] = useState(defaultAberto);

  function alternar() {
    setAberto((atual) => !atual);
  }

  return (
    <div className="mb-3">
      <div
        className="d-flex justify-content-between align-items-center card-header-colapsavel rounded px-2 py-1"
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
        <span className="small text-muted">
          {titulo} ({quantidade})
        </span>
        <span className="chevron-colapso" aria-hidden="true">
          {aberto ? '▾' : '▸'}
        </span>
      </div>
      <Collapse in={aberto}>
        <div className="mt-1">{children}</div>
      </Collapse>
    </div>
  );
}
