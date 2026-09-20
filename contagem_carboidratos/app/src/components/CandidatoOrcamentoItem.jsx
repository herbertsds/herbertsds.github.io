import { Badge } from 'react-bootstrap';
import { formatarNumero, textoMedidaComPeso } from '../domain/calculos';
import { textoQuantidadeMaxima } from '../domain/substituicao';

// Um cartão da lista de candidatos (usada tanto na Sugestão de Substituição quanto ao
// adicionar um alimento direto numa refeição do dia): nome, medida usual, os marcadores de
// kcal e de CHO **separados** (verde "-resta" quando cabe, vermelho "+excede" quando não
// cabe — só aparece o eixo que está sendo respeitado) e, sempre que houver um teto, a porção
// máxima que ainda caberia sem passar. Clicável em qualquer caso — cabe ou não, a decisão de
// estourar o orçamento é do usuário, não do app. Mesmo cartão branco (`.item-alimento-editavel`)
// dos itens já lançados, pra ficar visualmente consistente — só ganha a classe `clicavel`.
//
// Cada pedaço sempre em sua própria linha (nome / medida / badges / kcal·CHO / "pode
// consumir") — nunca compartilhando linha com quebra condicional (`flex-wrap` decidindo na
// hora, dependendo do tamanho do nome ou do texto). Antes, alguns cards paginavam numa altura
// e outros noutra, dependendo só de o texto ter quebrado ou não; com a estrutura fixa, todo
// card no mesmo contexto tem o mesmo número de linhas.
export function CandidatoOrcamentoItem({ candidato: c, onSelecionar }) {
  const maximo = textoQuantidadeMaxima(c.alimento, c.quantidadeMaximaG, c.quantidadeMaximaMedidas);

  function ativar() {
    onSelecionar(c.alimento, c.quantidadeTeste);
  }

  return (
    <div
      className="item-alimento-editavel clicavel"
      role="button"
      tabIndex={0}
      onClick={ativar}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          ativar();
        }
      }}
    >
      <div className="fw-semibold">{c.alimento.alimento}</div>
      <small className="text-muted d-block">({textoMedidaComPeso(c.alimento)})</small>
      <div className="d-flex gap-1 flex-wrap mt-1">
        {c.excedeKcalEm > 0 && (
          <Badge bg="danger" className="text-nowrap">
            +{Math.round(c.excedeKcalEm)} kcal
          </Badge>
        )}
        {c.restanteKcalDepois !== null && (
          <Badge bg="success" className="text-nowrap">
            -{Math.round(c.restanteKcalDepois)} kcal
          </Badge>
        )}
        {c.excedeChoEm > 0 && (
          <Badge bg="danger" className="text-nowrap">
            +{formatarNumero(c.excedeChoEm)} g CHO
          </Badge>
        )}
        {c.restanteChoDepois !== null && (
          <Badge bg="success" className="text-nowrap">
            -{formatarNumero(c.restanteChoDepois)} g CHO
          </Badge>
        )}
      </div>
      <small className="text-muted d-block mt-1">
        {Math.round(c.acrescimoKcal)} kcal · {formatarNumero(c.acrescimoCho)} g CHO na medida usual
      </small>
      {maximo && <small className="text-muted d-block">pode consumir até {maximo}</small>}
    </div>
  );
}
