import { useMemo, useState } from 'react';
import { Form } from 'react-bootstrap';
import { buscarAlimentos } from '../domain/busca';
import { formatarNumero, textoMedidaComPeso } from '../domain/calculos';
import { ListaPaginada } from './ListaPaginada';
import { fecharTecladoNoEnter } from '../utils/teclado';

// Busca + lista paginada sempre visível (igual à de Refeições), sem classificação de
// orçamento — o Plano não tem "meta vs. consumido", ele É a meta.
export function BuscaAlimentosPlano({ alimentos, onAdicionar }) {
  const [consulta, setConsulta] = useState('');
  const itens = useMemo(() => buscarAlimentos(alimentos, consulta, alimentos.length), [alimentos, consulta]);

  return (
    <div className="mt-2">
      <Form.Control
        className="mb-2"
        placeholder="Buscar alimento..."
        value={consulta}
        onChange={(e) => setConsulta(e.target.value)}
        enterKeyHint="search"
        onKeyDown={fecharTecladoNoEnter}
      />
      <ListaPaginada
        itens={itens}
        itensPorPagina={5}
        resetKey={consulta}
        renderItem={(a) => {
          const adicionar = () => {
            onAdicionar(a.id, a.quantidade_indefinida ? 1 : a.quantidade_g_ml);
            setConsulta('');
          };
          return (
          <div
            className="item-alimento-editavel clicavel"
            role="button"
            tabIndex={0}
            key={a.id}
            onClick={adicionar}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                adicionar();
              }
            }}
          >
            <div className="fw-semibold">{a.alimento}</div>
            <small className="text-muted d-block">({textoMedidaComPeso(a)})</small>
            <small className="text-muted d-block mt-1">
              {Math.round(a.calorias_kcal)} kcal · {formatarNumero(a.carboidratos_g)} g CHO
            </small>
          </div>
          );
        }}
      />
    </div>
  );
}
