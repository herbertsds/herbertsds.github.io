import { MedidorNutricional } from './MedidorNutricional';

const CLASSE_POR_TAMANHO = {
  grande: 'resumo-nutricional-grande',
  compacto: 'resumo-nutricional-compacto',
};

// Bloco de calorias/carboidratos (consumido vs. meta, ou cesta vs. orçamento — o mesmo
// formato serve pros dois) — número grande + % + barra colorida por severidade.
// `tamanho="grande"` é usado só no total do dia (o "hero" da página); `tamanho="compacto"`
// em modais com bastante outra informação (ex: a cesta de substituição); os demais usos (por
// refeição) ficam no tamanho padrão.
export function ResumoNutricional({ titulo, consumidoKcal, consumidoCho, metaKcal, metaCho, tamanho = 'padrao' }) {
  return (
    <div className={`resumo-nutricional ${CLASSE_POR_TAMANHO[tamanho] ?? ''}`}>
      {titulo && <div className="resumo-titulo">{titulo}</div>}
      <div className="resumo-medidores">
        <MedidorNutricional
          rotulo="Calorias"
          consumido={consumidoKcal}
          meta={metaKcal}
          unidade="kcal"
          casas={0}
          tamanho={tamanho}
        />
        <MedidorNutricional
          rotulo="Carboidratos"
          consumido={consumidoCho}
          meta={metaCho}
          unidade="g"
          casas={1}
          tamanho={tamanho}
        />
      </div>
    </div>
  );
}
