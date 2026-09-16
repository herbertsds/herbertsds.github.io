import { Form, Button } from 'react-bootstrap';

// Controles de filtro (todos / só os que cabem / só os que ultrapassam) e ordenação (por
// calorias ou carboidratos, crescente ou decrescente) — reaproveitados na lista de candidatos
// da Sugestão de Substituição e na de "o que cabe (e o que ultrapassa)" ao adicionar um
// alimento direto numa refeição.
export function FiltroOrdenacaoCandidatos({
  filtro,
  onFiltroChange,
  ordenarPor,
  onOrdenarPorChange,
  direcao,
  onDirecaoChange,
}) {
  return (
    <div className="d-flex gap-2 mb-2 flex-wrap align-items-center">
      <Form.Select
        size="sm"
        style={{ maxWidth: 190 }}
        value={filtro}
        onChange={(e) => onFiltroChange(e.target.value)}
        aria-label="Filtrar candidatos"
      >
        <option value="todos">Todos</option>
        <option value="cabem">Só os que cabem</option>
        <option value="ultrapassam">Só os que ultrapassam</option>
      </Form.Select>
      <Form.Select
        size="sm"
        style={{ maxWidth: 190 }}
        value={ordenarPor ?? ''}
        onChange={(e) => onOrdenarPorChange(e.target.value || null)}
        aria-label="Ordenar candidatos"
      >
        <option value="">Sem ordenação</option>
        <option value="kcal">Ordenar por calorias</option>
        <option value="cho">Ordenar por carboidratos</option>
      </Form.Select>
      {ordenarPor && (
        <Button size="sm" variant="outline-secondary" onClick={() => onDirecaoChange(direcao === 'asc' ? 'desc' : 'asc')}>
          {direcao === 'asc' ? 'Crescente ↑' : 'Decrescente ↓'}
        </Button>
      )}
    </div>
  );
}
