import { useState } from 'react';
import { Card, Button, Badge, Collapse } from 'react-bootstrap';
import { AlimentoBuscaInput } from './AlimentoBuscaInput';
import { AlimentoQuantidadeModal } from './AlimentoQuantidadeModal';
import { ItemAlimentoEditavel } from './ItemAlimentoEditavel';
import { calcularItem, calcularTotalItens, formatarNumero } from '../domain/calculos';

const ROTULOS_ORIGEM = {
  'sugestao-plano': { texto: 'do plano', bg: 'info' },
  substituicao: { texto: 'substituição', bg: 'warning', text: 'dark' },
};

// Card genérico de refeição: cabeçalho (tipo/horário + editar/excluir, ou — quando
// `colapsavel` — só o tipo e o indicador de colapso, já que a barra toda vira clicável) , o
// resumo de calorias/carboidratos logo em seguida (a informação principal — sempre visível,
// mesmo colapsado) e, escondível (`colapsavel`), o resto: toggles de Respeitar
// calorias/carboidratos (`depoisDoResumo`), a lista de itens já lançados, e a área de
// adicionar — sugestões do plano (`sugestoesDoPlano`) primeiro, busca livre
// (`AlimentoBuscaInput`, só quando NÃO há edição de quantidade — ver abaixo) logo abaixo
// dela, depois `rodape` (lista de candidatos por orçamento) e `extra` (sugestão de
// substituição). Usado tanto no Plano Nutricional quanto nas Refeições do Dia — o que muda
// entre eles entra via esses slots. `onEditar`/`onExcluir` são opcionais (só o Plano os usa,
// nunca junto de `colapsavel`). O horário (fixo ou editável via
// `onHorarioRegistradoChange`) não mora mais aqui — quem chama é responsável por colocá-lo
// dentro do `resumo` (ver `extra` de `ResumoNutricional`), pra barra do cabeçalho poder ficar
// livre pra ser o clique inteiro do colapso, sem um `<input type="time">` no meio brigando
// pelo clique. `onEditarQuantidadeItem` (só o Dia) troca cada item já lançado por um
// `ItemAlimentoEditavel` (dose original + dose ajustada + limite) em vez da linha estática —
// e, como esse mesmo componente já cobre "buscar e adicionar" via `rodape`
// (`AlimentosNoOrcamento`), a busca livre do topo (que abre um modal de quantidade à parte)
// fica redundante nesse caso e não é renderizada.
export function RefeicaoCard({
  refeicao,
  alimentos,
  alimentosPorId,
  onAdicionarItem,
  onRemoverItem,
  onEditarQuantidadeItem,
  ocultarBuscaLivre = false,
  meta,
  respeitarCalorias,
  respeitarCarboidratos,
  onEditar,
  onExcluir,
  totalLabel,
  resumo,
  depoisDoResumo,
  sugestoesDoPlano,
  rodape,
  extra,
  permitirVariacoes = false,
  variacoesPorBase,
  colapsavel = false,
}) {
  const [alimentoEmEscolha, setAlimentoEmEscolha] = useState(null);
  const [aberto, setAberto] = useState(!colapsavel);
  const total = calcularTotalItens(refeicao.itens, alimentosPorId);

  function alternarAberto() {
    setAberto((atual) => !atual);
  }

  const conteudoColapsavel = (
    // O Collapse do react-bootstrap mede/anima um único nó DOM — precisa de UM filho real
    // (não um Fragment com vários irmãos no topo), senão quebra ao tentar medir a altura.
    <div>
      {depoisDoResumo && <Card.Body className="pt-0 pb-2">{depoisDoResumo}</Card.Body>}

      {refeicao.itens.length > 0 && (
        <div className="p-3 pt-0">
          <div className="lista-itens-refeicao">
            {refeicao.itens.map((item) => {
              const alimento = alimentosPorId.get(item.alimentoId);
              const rotulo = ROTULOS_ORIGEM[item.origem];

              if (onEditarQuantidadeItem) {
                const usoOutrosItens = calcularTotalItens(
                  refeicao.itens.filter((i) => i.id !== item.id),
                  alimentosPorId,
                );
                return (
                  <ItemAlimentoEditavel
                    key={item.id}
                    alimento={alimento}
                    alimentosPorId={alimentosPorId}
                    quantidade={item.quantidadeG}
                    onChangeQuantidade={(novaQuantidade) => onEditarQuantidadeItem(item.id, novaQuantidade)}
                    onRemover={() => onRemoverItem(item.id)}
                    rotulo={rotulo}
                    orcamento={meta}
                    usoOutros={usoOutrosItens}
                    respeitarCalorias={respeitarCalorias}
                    respeitarCarboidratos={respeitarCarboidratos}
                  />
                );
              }

              const { kcal, cho } = calcularItem(item, alimentosPorId);
              const unidade = alimento?.quantidade_indefinida
                ? `${formatarNumero(item.quantidadeG, 2)}x ${alimento.medida}`
                : `${formatarNumero(item.quantidadeG)} g`;
              return (
                <div key={item.id} className="item-alimento-editavel">
                  <div className="d-flex justify-content-between align-items-start gap-2">
                    <div className="item-alimento-nome">
                      {alimento ? alimento.alimento : 'Alimento removido do catálogo'}
                      {rotulo && (
                        <Badge bg={rotulo.bg} text={rotulo.text} className="ms-2">
                          {rotulo.texto}
                        </Badge>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="link"
                      className="text-danger p-0"
                      onClick={() => onRemoverItem(item.id)}
                    >
                      remover
                    </Button>
                  </div>
                  <small className="text-muted">
                    {unidade} · {Math.round(kcal)} kcal · {formatarNumero(cho)} g CHO
                  </small>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Card.Body className={refeicao.itens.length > 0 ? 'pt-0' : ''}>
        {sugestoesDoPlano}
        {!ocultarBuscaLivre && <AlimentoBuscaInput alimentos={alimentos} onSelecionar={setAlimentoEmEscolha} />}
        {totalLabel && (
          <div className="mt-2 d-flex justify-content-between">
            <span>{totalLabel}</span>
            <strong>
              {Math.round(total.kcal)} kcal · {formatarNumero(total.cho)} g CHO
            </strong>
          </div>
        )}
        {rodape}
        {extra}
      </Card.Body>
    </div>
  );

  return (
    <Card className="mb-3 shadow-sm">
      <Card.Header
        className={`d-flex justify-content-between align-items-center flex-wrap gap-2 ${colapsavel ? 'card-header-colapsavel' : ''}`}
        onClick={colapsavel ? alternarAberto : undefined}
        role={colapsavel ? 'button' : undefined}
        tabIndex={colapsavel ? 0 : undefined}
        onKeyDown={
          colapsavel
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  alternarAberto();
                }
              }
            : undefined
        }
        aria-expanded={colapsavel ? aberto : undefined}
      >
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <strong>{refeicao.tipo}</strong>
          {!resumo && <span className="text-muted">{refeicao.horario}</span>}
        </div>
        {(onEditar || onExcluir || colapsavel) && (
          <div className="d-flex align-items-center gap-1">
            {onEditar && (
              <Button size="sm" variant="outline-secondary" onClick={onEditar}>
                Editar
              </Button>
            )}
            {onExcluir && (
              <Button size="sm" variant="outline-danger" onClick={onExcluir}>
                Excluir
              </Button>
            )}
            {colapsavel && (
              <span className="chevron-colapso" aria-hidden="true">
                {aberto ? '▾' : '▸'}
              </span>
            )}
          </div>
        )}
      </Card.Header>

      {resumo && <Card.Body className="pb-2">{resumo}</Card.Body>}

      {colapsavel ? <Collapse in={aberto}>{conteudoColapsavel}</Collapse> : conteudoColapsavel}

      <AlimentoQuantidadeModal
        alimento={alimentoEmEscolha}
        variacoes={variacoesPorBase?.get(alimentoEmEscolha?.id) ?? []}
        permitirVariacoes={permitirVariacoes}
        aberto={!!alimentoEmEscolha}
        onFechar={() => setAlimentoEmEscolha(null)}
        onConfirmar={(alimentoId, quantidade) => onAdicionarItem(alimentoId, quantidade)}
      />
    </Card>
  );
}
