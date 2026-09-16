import { MedidorNutricional } from './MedidorNutricional';

const CLASSE_POR_TAMANHO = {
  grande: 'resumo-nutricional-grande',
  compacto: 'resumo-nutricional-compacto',
};

// Bloco de calorias/carboidratos (consumido vs. meta, ou cesta vs. orçamento — o mesmo
// formato serve pros dois) — número grande + % + barra colorida por severidade.
// `tamanho="grande"` é usado só no total do dia (o "hero" da página); `tamanho="compacto"`
// em modais com bastante outra informação (ex: a cesta de substituição); os demais usos (por
// refeição) ficam no tamanho padrão. `extra` é um espaço pro que quem chama quiser colocar ao
// lado do título — hoje só o horário registrado da refeição (`RefeicaoDoDiaCard`), que
// precisou sair do cabeçalho do card pra esse virar inteiro clicável (colapso).
export function ResumoNutricional({
  titulo,
  consumidoKcal,
  consumidoCho,
  metaKcal,
  metaCho,
  tamanho = 'padrao',
  contexto,
  textoExplicativo,
  extra,
}) {
  return (
    <div className={`resumo-nutricional ${CLASSE_POR_TAMANHO[tamanho] ?? ''}`}>
      {(titulo || extra) && (
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
          {titulo && <div className="resumo-titulo">{titulo}</div>}
          {extra}
        </div>
      )}
      <div className="resumo-medidores">
        <MedidorNutricional
          rotulo="Calorias"
          consumido={consumidoKcal}
          meta={metaKcal}
          unidade="kcal"
          casas={0}
          tamanho={tamanho}
          contexto={contexto}
          textoExplicativo={textoExplicativo}
        />
        <MedidorNutricional
          rotulo="Carboidratos"
          consumido={consumidoCho}
          meta={metaCho}
          unidade="g"
          casas={1}
          tamanho={tamanho}
          contexto={contexto}
          textoExplicativo={textoExplicativo}
        />
      </div>
    </div>
  );
}
