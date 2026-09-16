import { useMemo, useState } from 'react';
import { Typeahead } from 'react-bootstrap-typeahead';
import { buscarAlimentos } from '../domain/busca';
import { formatarNumero } from '../domain/calculos';
import 'react-bootstrap-typeahead/css/Typeahead.css';

// Caixa de busca de alimentos reaproveitada em toda a aplicação (refeições do plano,
// refeições do dia, cesta de substituição). O ranking vem de domain/busca.js, não do
// filtro padrão do Typeahead — por isso filterBy sempre retorna true.
export function AlimentoBuscaInput({ alimentos, onSelecionar, placeholder = 'Buscar alimento...' }) {
  const [consulta, setConsulta] = useState('');

  const opcoes = useMemo(() => buscarAlimentos(alimentos, consulta, 25), [alimentos, consulta]);

  return (
    <Typeahead
      id="busca-alimento"
      labelKey="alimento"
      options={opcoes}
      selected={[]}
      onInputChange={setConsulta}
      onChange={(selecionados) => {
        if (selecionados[0]) onSelecionar(selecionados[0]);
      }}
      filterBy={() => true}
      placeholder={placeholder}
      minLength={1}
      renderMenuItemChildren={(alimento) => (
        <div>
          <div>{alimento.alimento}</div>
          <small className="text-muted">
            {alimento.medida} · {Math.round(alimento.calorias_kcal)} kcal · {formatarNumero(alimento.carboidratos_g)}g CHO
          </small>
        </div>
      )}
    />
  );
}
