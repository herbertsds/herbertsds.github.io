import { formatarNumero } from '../domain/calculos';

// Escala de cor contínua pela porcentagem consumida: verde (dentro da meta) -> amarelo (na
// metade) -> vermelho (bateu ou passou da meta). Interpola em RGB entre essas três paradas —
// por isso não são 3 estados fixos, é um gradiente de verdade.
const PARADAS_ESCALA = [
  { p: 0, rgb: [12, 163, 12] }, // verde
  { p: 0.5, rgb: [250, 178, 25] }, // amarelo
  { p: 1, rgb: [208, 59, 59] }, // vermelho
];

function corDaEscala(percentual) {
  const p = Math.max(0, Math.min(percentual, 1));
  for (let i = 0; i < PARADAS_ESCALA.length - 1; i++) {
    const atual = PARADAS_ESCALA[i];
    const proxima = PARADAS_ESCALA[i + 1];
    if (p >= atual.p && p <= proxima.p) {
      const t = (p - atual.p) / (proxima.p - atual.p);
      const rgb = atual.rgb.map((canal, indice) => Math.round(canal + (proxima.rgb[indice] - canal) * t));
      return rgb;
    }
  }
  return PARADAS_ESCALA[PARADAS_ESCALA.length - 1].rgb;
}

function misturarComBranco(rgb, proporcaoBranco) {
  return rgb.map((canal) => Math.round(canal + (255 - canal) * proporcaoBranco));
}

function formatar(valor, casas) {
  return casas === 0 ? String(Math.round(valor)) : formatarNumero(valor, casas);
}

// Frase padrão pra explicar o big number quando é "consumido vs. meta" (Meta da
// Refeição/Total do dia): quanto ainda dá pra comer, ou quanto já passou da meta. `null` sem
// `contexto` (outros usos, como a cesta da Substituição, passam `textoExplicativo` próprio).
function explicacaoPadrao({ restante, unidade, contexto }) {
  const nome = unidade === 'kcal' ? 'calorias' : 'de carboidratos';
  if (restante >= 0) {
    return `Você ainda pode comer ${formatar(restante, unidade === 'kcal' ? 0 : 1)} ${unidade} ${nome === 'calorias' ? '' : nome + ' '}${contexto}.`;
  }
  return `Você já passou ${formatar(Math.abs(restante), unidade === 'kcal' ? 0 : 1)} ${unidade} ${nome === 'calorias' ? '' : nome + ' '}da meta ${contexto}.`;
}

// Um "medidor": rótulo, número grande com consumido/meta, a porcentagem embaixo (menor), uma
// barra de progresso (preenchimento e texto na cor da escala) e, por padrão, uma frase curta
// explicando o número ("Você ainda pode comer X kcal nessa refeição"). `contexto` ("nessa
// refeição"/"no dia") monta a frase padrão; `textoExplicativo({ consumido, meta, restante,
// unidade, rotulo })` substitui a frase inteira pra usos que não são "consumido vs. meta" (ex:
// a cesta da Substituição, que é "soma dos alimentos escolhidos"). Nenhum dos dois = sem
// frase.
export function MedidorNutricional({
  rotulo,
  consumido,
  meta,
  unidade,
  casas = 0,
  tamanho = 'padrao',
  contexto,
  textoExplicativo,
}) {
  const metaSegura = meta > 0 ? meta : 0;
  const percentual = metaSegura > 0 ? consumido / metaSegura : consumido > 0 ? 1 : 0;
  const restante = metaSegura - consumido;

  const rgb = corDaEscala(percentual);
  const cor = `rgb(${rgb.join(',')})`;
  const corTrilho = `rgb(${misturarComBranco(rgb, 0.8).join(',')})`;

  const classeNumero =
    tamanho === 'grande'
      ? 'medidor-numero medidor-numero-grande'
      : tamanho === 'compacto'
        ? 'medidor-numero medidor-numero-compacto'
        : 'medidor-numero';

  let explicacao = null;
  if (textoExplicativo) {
    explicacao = textoExplicativo({ consumido, meta: metaSegura, restante, unidade, rotulo });
  } else if (contexto) {
    explicacao = explicacaoPadrao({ restante, unidade, contexto });
  }

  return (
    <div className="medidor-nutricional">
      <div className="medidor-rotulo">{rotulo}</div>
      <div className={classeNumero} style={{ color: cor }}>
        {formatar(consumido, casas)}/{formatar(metaSegura, casas)} {unidade}
      </div>
      <div className="medidor-percentual" style={{ color: cor }}>
        {Math.round(percentual * 100)}%
      </div>
      <div className="medidor-trilho" style={{ background: corTrilho }}>
        <div
          className="medidor-preenchimento"
          style={{ width: `${Math.min(percentual, 1) * 100}%`, background: cor }}
        />
      </div>
      {explicacao && <div className="medidor-explicacao">{explicacao}</div>}
    </div>
  );
}
