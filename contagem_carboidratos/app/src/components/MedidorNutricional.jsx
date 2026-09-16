import { arredondar } from '../domain/calculos';

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
  return casas === 0 ? String(Math.round(valor)) : String(arredondar(valor, casas));
}

// Um "medidor": rótulo, número grande com consumido/meta, a porcentagem embaixo (menor), e
// uma barra de progresso — preenchimento e texto na cor da escala (verde -> amarelo ->
// vermelho conforme a porcentagem consumida), trilha na mesma cor bem clareada.
export function MedidorNutricional({ rotulo, consumido, meta, unidade, casas = 0, tamanho = 'padrao' }) {
  const metaSegura = meta > 0 ? meta : 0;
  const percentual = metaSegura > 0 ? consumido / metaSegura : consumido > 0 ? 1 : 0;

  const rgb = corDaEscala(percentual);
  const cor = `rgb(${rgb.join(',')})`;
  const corTrilho = `rgb(${misturarComBranco(rgb, 0.8).join(',')})`;

  const classeNumero =
    tamanho === 'grande'
      ? 'medidor-numero medidor-numero-grande'
      : tamanho === 'compacto'
        ? 'medidor-numero medidor-numero-compacto'
        : 'medidor-numero';

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
    </div>
  );
}
