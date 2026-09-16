import { formatarNumero } from '../domain/calculos';

// Versão "só meta" do resumo grande de calorias/carboidratos: mesmas classes CSS do
// ResumoNutricional/MedidorNutricional (pra ter o mesmo peso visual — número grande), mas sem
// "consumido", % ou barra. Usada no Plano Nutricional, que não tem consumo — só o que foi
// receitado — e na impressão por refeição.
export function ResumoMetaRefeicao({
  titulo,
  metaKcal,
  metaCho,
  tamanho = 'padrao',
  extra,
  mostrarKcal = true,
  mostrarCho = true,
}) {
  const classeNumero = tamanho === 'grande' ? 'medidor-numero medidor-numero-grande' : 'medidor-numero';
  return (
    <div className={`resumo-nutricional ${tamanho === 'grande' ? 'resumo-nutricional-grande' : ''}`}>
      {(titulo || extra) && (
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
          {titulo && <div className="resumo-titulo">{titulo}</div>}
          {extra}
        </div>
      )}
      <div className="resumo-medidores">
        {mostrarKcal && (
          <div className="medidor-nutricional">
            <div className="medidor-rotulo">Calorias</div>
            <div className={classeNumero}>{Math.round(metaKcal)} kcal</div>
          </div>
        )}
        {mostrarCho && (
          <div className="medidor-nutricional">
            <div className="medidor-rotulo">Carboidratos</div>
            <div className={classeNumero}>{formatarNumero(metaCho)} g</div>
          </div>
        )}
      </div>
    </div>
  );
}
