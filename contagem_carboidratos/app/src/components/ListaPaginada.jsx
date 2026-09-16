import { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';

// Lista paginada genérica: em vez de cortar o resultado num limite arbitrário com scroll
// (a lista deixava de ser exaustiva — itens relevantes ficavam de fora), pagina o resultado
// inteiro em páginas de tamanho fixo. `resetKey` volta pra página 1 sempre que muda (ex: o
// texto da busca) — sem isso, trocar de busca poderia deixar a paginação numa página que nem
// existe mais no novo resultado.
export function ListaPaginada({ itens, renderItem, itensPorPagina = 3, resetKey, semResultados = 'Nada encontrado.' }) {
  const [pagina, setPagina] = useState(1);

  useEffect(() => {
    setPagina(1);
  }, [resetKey]);

  const totalPaginas = Math.max(1, Math.ceil(itens.length / itensPorPagina));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const inicio = (paginaAtual - 1) * itensPorPagina;
  const itensDaPagina = itens.slice(inicio, inicio + itensPorPagina);

  return (
    <div className="mb-3">
      <div className="lista-itens-refeicao">
        {itensDaPagina.map(renderItem)}
        {itens.length === 0 && <div className="text-muted small">{semResultados}</div>}
      </div>
      {totalPaginas > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-1">
          <Button
            size="sm"
            variant="outline-secondary"
            disabled={paginaAtual === 1}
            onClick={() => setPagina(paginaAtual - 1)}
          >
            ‹ anterior
          </Button>
          <small className="text-muted">
            Página {paginaAtual} de {totalPaginas} ({itens.length} no total)
          </small>
          <Button
            size="sm"
            variant="outline-secondary"
            disabled={paginaAtual === totalPaginas}
            onClick={() => setPagina(paginaAtual + 1)}
          >
            próxima ›
          </Button>
        </div>
      )}
    </div>
  );
}
