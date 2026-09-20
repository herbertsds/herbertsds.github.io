# Refeições (do dia): sempre exibidas, gravadas só sob demanda

## Por que mudou (duas vezes)

Primeiro: o usuário precisava clicar em "+ Refeição" pra criar, em cada dia, uma entrada
correspondente a cada refeição do plano — repetitivo, já que o conjunto de refeições do dia é
sempre o mesmo conjunto do plano. Isso foi trocado por auto-materialização: toda refeição do
plano passou a ser **exibida** automaticamente.

A primeira versão dessa auto-materialização **gravava** (persistia) uma refeição vazia em
localStorage assim que o dia era aberto — mesmo sem o usuário interagir. Isso se mostrou
errado na prática: abrir um dia qualquer (só de passar por ele navegando) já sujava o
armazenamento com refeições vazias daquele dia, mesmo que o usuário nunca fosse registrar nada
ali. A versão atual separa **exibir** de **gravar**: nada é escrito só por visualizar.

## Como funciona agora

Em `RefeicoesDoDia.jsx`, `refeicoesParaExibir` (um `useMemo`) monta a lista renderizada
mesclando o que está de verdade em `diaRegistro.refeicoes` com um objeto **virtual** (só em
memória, nunca gravado) para cada tipo do plano que ainda não tem entrada real nesse dia —
`{ id: 'virtual:<tipo>', tipo, horario, horarioRegistrado: null, itens: [] }`. Isso roda toda
vez que a página renderiza, não um efeito colateral — não existe mais nenhuma escrita
automática disparada só por trocar de dia.

Quando o usuário faz qualquer ação numa refeição virtual — adicionar um alimento, clicar numa
sugestão do plano, registrar um horário, aplicar uma substituição —, o hook
`useRefeicoesDoDia` a materializa de verdade **na mesma gravação** da ação
(`comRefeicaoGarantida`, usado internamente por `adicionarItem`/`adicionarItens`/
`editarRefeicao`/`substituirItensNaRefeicao`, todos recebendo um `criarSeNaoExistir: { tipo,
horario }` opcional). Só a refeição tocada é criada — as outras refeições virtuais do mesmo
dia continuam só na tela, sem nada gravado, até que também sejam tocadas.

**O inverso também é automático**: `persistir` (o único ponto de gravação do hook) filtra, a
cada escrita, qualquer refeição sem itens **e** sem `horarioRegistrado` — nunca fica uma
refeição vazia gravada. Na prática: remover o último alimento de uma refeição faz ela sumir do
armazenamento daquele dia (volta a ser a exibição virtual do plano); se todas as refeições do
dia ficarem vazias, o registro do dia inteiro volta a `{ data, refeicoes: [] }`.

### Categoria nova no plano: só aparece a partir do dia em que foi criada

Se o plano ganha um tipo novo (ex: o usuário adiciona "Desjejum" hoje), ele só aparece
(virtualmente) a partir de **hoje em diante** — não retroage pra dias passados. Antes disso não
existia esse filtro: qualquer tipo novo aparecia em **todo** dia, inclusive navegando pra trás
no calendário, o que é estranho (o plano daquele dia passado, na época, não incluía esse tipo).

Implementado com dois campos gravados em cada refeição do plano na hora da criação
(`usePlanoNutricional.js`, `adicionarRefeicao`):
- `criadoEm` (`Date.now()`) — desempata a ordem quando duas refeições do plano têm o **mesmo
  horário**: tanto na lista do Plano (`PlanoNutricional.jsx`) quanto na materialização virtual
  aqui, o sort é `horário, depois criadoEm` (ordem de criação como critério secundário).
- `criadoEmData` (`dataLocalISO()`, ver `src/lib/data.js`) — o dia local em que a refeição foi
  criada. Em `refeicoesParaExibir`, um tipo do plano só entra em `tiposDoPlano` se
  `!r.criadoEmData || r.criadoEmData <= data` (`data` = o dia sendo exibido).

Refeições do plano cadastradas **antes** desses campos existirem não têm `criadoEmData` nem
`criadoEm` — tratadas como "sempre existiu": continuam aparecendo em qualquer dia (a condição
`!r.criadoEmData` deixa passar) e entram primeiro em qualquer desempate por horário (`?? 0`).
Não precisa de nenhuma migração de dados existentes.

## Horário registrado vs. horário do plano

Cada refeição do dia tem dois horários:
- `horario` — herdado do plano no momento em que a refeição é materializada (ou só exibida,
  se ainda for virtual); nunca editado depois — é a referência/o padrão.
- `horarioRegistrado` — nulo até o usuário mexer; o horário em que a refeição foi *de fato*
  feita. Editável direto no cabeçalho do card (`<input type="time">`, sem modal), via
  `RefeicaoCard`'s prop `onHorarioRegistradoChange` → chama `editarRefeicao(id, {
  horarioRegistrado }, criarSeNaoExistir)`.

Pra exibição e ordenação (`horarioEfetivo` em `RefeicoesDoDia.jsx`), vale
`horarioRegistrado ?? horario` — antes de o usuário registrar um horário, a lista continua
ordenada pelo horário programado do plano.

## O que não existe mais aqui

- Botão "+ Refeição" / `RefeicaoFormModal` — removido de Refeições (continua existindo só no
  Plano, sem a variante restrita que existia antes).
- Editar/Excluir a refeição inteira — não faz sentido excluir algo que volta a aparecer
  (virtualmente) na próxima renderização; `RefeicaoCard` só mostra esses botões quando
  `onEditar`/`onExcluir` são passados (o Plano passa, o Dia não).

Consequência no hook `useRefeicoesDoDia`: `adicionarRefeicao`, `excluirRefeicao` e
`garantirRefeicoes` (a versão anterior, que gravava antecipadamente) foram todos removidos —
`comRefeicaoGarantida` (interno, chamado dentro de cada mutação) é a única forma de uma
refeição passar a existir de verdade agora.

## Navegação de data: reservar o espaço do "voltar para hoje"

Os botões ‹ › e o link "voltar para hoje" ficam na mesma linha flex que o
`<input type="date">`. O link só faz sentido quando o dia selecionado não é hoje — mas
renderizá-lo condicionalmente (`{!ehHoje && <Button>...}`) muda a altura dessa coluna (uma
linha vs. duas). Duas correções, na ordem que os problemas apareceram:

1. O botão passou a ser **sempre** renderizado (só fica com a classe `invisible` do
   Bootstrap, e `disabled`, quando `ehHoje`) — a altura da coluna fica constante entre os dois
   estados.
2. Isso sozinho não bastava: o container usava `align-items-center`, então ‹ › ficavam
   centralizados **verticalmente em relação às duas linhas** (input + link, mesmo quando o
   link só está invisível) — ou seja, sempre um pouco mais baixo que o input, não alinhados
   com ele. A correção final trocou `align-items-center` por `align-items-start`: ‹ › ficam
   ancorados no **topo** da coluna — que é sempre o input — independente de quantas linhas
   existirem abaixo dele.

## `RefeicaoDoDiaCard` — um card por refeição, com estado próprio

Cada refeição do dia é renderizada por `components/RefeicaoDoDiaCard.jsx`, não mais montada
inline dentro do `.map()` de `RefeicoesDoDia.jsx`. O motivo é que os toggles **Respeitar
calorias**/**Respeitar carboidratos** viraram estado de verdade (`useState`), próprio de cada
refeição — e hooks não podem ser chamados dentro de um `.map()`. `RefeicoesDoDia.jsx` continua
calculando o que depende do dia inteiro (data, refeições a exibir, meta por tipo) e só passa
pra baixo; cada `RefeicaoDoDiaCard` monta o `consumido`, as `sugestoesRestantes` e o
`orcamentoRestante` daquela refeição específica, e é dono dos toggles.

**`key={refeicao.tipo}`, não `key={refeicao.id}`**: uma refeição ainda virtual tem o id
sintético `virtual:<tipo>`; assim que o primeiro item é lançado, `comRefeicaoGarantida` gera um
id novo de verdade (materialização, ver acima). Se o `.map()` de `RefeicoesDoDia.jsx` usasse
`refeicao.id` como key, esse troca de id no exato momento de materializar faria o React
desmontar o `RefeicaoDoDiaCard` antigo e montar um novo do zero — perdendo todo o estado local
que ele acabou de construir (colapso aberto/fechado, os dois toggles, o modal de busca aberto)
bem na hora em que o usuário está interagindo com o card. `refeicao.tipo` é estável nesse
momento (não muda com a materialização) e único
entre as refeições exibidas (`tiposDoPlano`, dentro de `refeicoesParaExibir`, já é deduplicado
por tipo) — resolve sem precisar propagar nenhum estado pra cima.

### Ordem dos blocos dentro do card

Fixada nessa ordem, de cima pra baixo (`RefeicaoCard.jsx` expõe os slots; quem decide o que
entra em cada um é `RefeicaoDoDiaCard.jsx`); com a refeição colapsada, **nenhum** item da lista
fica visível — só o cabeçalho (ver "Refeições colapsadas" abaixo). Todos os itens, do 2 em
diante, moram dentro do `Collapse`:

1. Cabeçalho (só o tipo + o indicador ▸/▾ — o horário só mora aqui quando colapsada, ver
   "Refeições colapsadas" abaixo).
2. **Meta da refeição** (`resumo`) — os números grandes de consumido/meta, e onde o horário
   registrado mora (prop `extra` de `ResumoNutricional`) enquanto a refeição está aberta.
3. **Respeitar calorias / Respeitar carboidratos** (`depoisDoResumo`) — imediatamente depois
   da meta, antes de qualquer lista. Ficam aqui (e não escondidos dentro da lista de
   candidatos, como antes) porque valem pra refeição inteira, não só pra uma lista específica.
4. Itens já lançados (ver "Editar a quantidade" abaixo).
5. **Sugestões do plano** (`sugestoesDoPlano`) — o que o plano já prevê pra essa refeição e
   ainda não foi lançado.
6. Botão grande **"+ Adicionar alimento"** (`rodape`) — abre o `BuscarAlimentoModal` com a
   busca e a lista "o que cabe (e o que ultrapassa) na meta" (ver [04](04-substituicao.md) e
   "Um só campo de busca" abaixo). **A busca livre do topo (`AlimentoBuscaInput`) não aparece
   no Dia** — só no Plano — porque esse botão já cobre "buscar e adicionar" sozinho.
7. "Sugerir substituição" (`extra`).

## Refeições colapsadas

Cada `RefeicaoCard` nas Refeições do Dia começa **colapsada** (prop `colapsavel` em
`RefeicaoCard.jsx`, só passada por `RefeicaoDoDiaCard.jsx` — o Plano não usa). O `Collapse` do
react-bootstrap (envolvendo tudo a partir do item 3 da lista acima) alterna clicando em
**qualquer ponto da barra do cabeçalho** — não só um botão pequeno: `Card.Header` inteiro
ganha `onClick` (mais `role="button"`, `tabIndex` e `onKeyDown` pra Enter/Espaço, já que uma
`div` clicável não é focável/acionável por teclado por padrão) quando `colapsavel`, com a
classe `.card-header-colapsavel` (cursor + destaque de hover) pra dar a pista visual. O ▸/▾
que sobra no canto é só um indicador (`.chevron-colapso`), não mais um `<Button>` com seu
próprio clique — não precisa mais, já que a barra toda já aciona.

Isso só foi possível depois de tirar o horário do cabeçalho (ver "Onde o horário mora agora"
abaixo): um `<input type="time">` ali dentro brigaria pelo clique com o colapso da barra —
teria que ter um `stopPropagation`, cliques em áreas "erradas" do cabeçalho ainda
colapsariam, etc. Mais simples tirar o input do caminho.

**Mudou de novo**: a Meta da Refeição (item 2 da lista acima) já foi deliberadamente colocada
**fora** do `Collapse`, pra dar pra ver o essencial sem precisar abrir cada card — decisão
revertida depois, porque a pessoa queria a refeição colapsada de verdade "totalmente fechada",
sem número nenhum até abrir de propósito. Hoje o `resumo` mora **dentro** de
`conteudoColapsavel`, junto com tudo mais — `RefeicaoCard.jsx` só decide se o `Card` inteiro
tem um `Collapse` em volta (`colapsavel`) ou não; o que fica dentro dele é sempre o mesmo bloco
(`resumo` incluído). Detalhe de implementação que não mudou: o `Collapse` do react-bootstrap
mede/anima um único nó DOM, então o conteúdo colapsável precisa estar dentro de um único
elemento (`<div>`) — um `Fragment` com vários filhos no topo quebra a medição de altura
(`TypeError: Cannot set properties of undefined`).

### Onde o horário mora agora

O horário registrado (fixo ou editável, via `onHorarioRegistradoChange`) fica dentro do card de
Meta da Refeição, como prop `extra` de `ResumoNutricional` (ver [07](07-resumo-nutricional.md))
— `RefeicaoDoDiaCard.jsx` monta o `<input type="time">` + "registrado" ali direto, em vez de
passar `onHorarioRegistradoChange` como prop pro `RefeicaoCard` (que não sabe nada sobre
horário) — **só enquanto a refeição está aberta**, já que o `resumo` (e o horário dentro dele)
some junto com o resto quando colapsada. Fechada, o horário reaparece no **cabeçalho**
(`RefeicaoCard.jsx`: `{(!resumo || !aberto) && <span>{refeicao.horarioRegistrado ??
refeicao.horario}</span>}`) — usando `horarioRegistrado` quando existe, nunca o horário fixo do
plano por engano, senão fechar a refeição depois de registrar um horário diferente mostraria a
hora errada.

## Um só campo de busca, atrás de um botão

Existiam dois jeitos de adicionar um alimento na mesma refeição: a busca livre do topo
(`AlimentoBuscaInput`, dentro do próprio `RefeicaoCard`, abre um modal de quantidade) e um campo
de busca sempre visível dentro do card, com sua própria lista. Redundante — os dois faziam a
mesma coisa. A prop `ocultarBuscaLivre` do `RefeicaoCard` esconde a primeira; tanto
`RefeicaoDoDiaCard.jsx` (Dia) quanto `RefeicaoPlanoCard.jsx` (Plano) passam essa prop hoje — ou
seja, o `AlimentoBuscaInput` de dentro do `RefeicaoCard` nunca roda de verdade em nenhuma das
duas telas.

**De busca sempre visível pra busca atrás de um botão**: primeiro no Dia, depois no Plano — as
duas telas passaram pela mesma transformação, só em momentos diferentes. No Dia,
`AlimentosNoOrcamento` (busca + filtro + ordenação + lista paginada, sempre expandida dentro do
card) virou incômodo — muita coisa sempre visível, competindo com "Sugestões do plano" e a
lista de itens já lançados. No Plano, era `BuscaAlimentosPlano` — mais simples (sem
classificação de orçamento, o Plano não tem "cabe/excede"), mas do mesmo jeito sempre visível e
sem passo de quantidade nenhum: clicar num item lançava direto na medida usual, sem chance de
ajustar antes. As duas viraram o mesmo `BuscarAlimentoModal.jsx`: o `rodape` do card agora é só
um botão grande, **"+ Adicionar alimento"**; clicar nele abre a busca (campo + lista de
candidatos) dentro de um modal — no Dia, com `FiltroOrdenacaoCandidatos` e a classificação
"cabe/ultrapassa" (`orcamentoRestante`/`respeitarCalorias`/`respeitarCarboidratos`); no Plano,
sem nenhum desses três props (não faz sentido classificar contra uma meta que não existe ali),
então nenhum badge de "cabe/excede" aparece — só nome, medida e kcal/CHO na medida usual.
`BuscaAlimentosPlano.jsx` foi apagado depois dessa troca, por ficar sem nenhum uso.

**Escolher um alimento sempre abre o passo de quantidade — nunca lança direto**: ao clicar num
candidato (nesse modal, ou numa "Sugestão do plano"), o modal de busca fecha e o
`AlimentoQuantidadeModal` abre no lugar — **sempre**, tenha o alimento uma variação de marca
cadastrada (ver [06](06-alimentos-e-backup.md)) ou não; quem decide se mostra o seletor de
variação é o próprio `AlimentoQuantidadeModal` (não mostra nada quando a lista de variações vem
vazia). Antes, só abria o modal quando havia variação — qualquer outro alimento lançava direto
na medida usual, sem chance de ajustar a quantidade antes. `BuscarAlimentoModal` implementa a
troca de "modal de busca" pra "modal de quantidade" com dois `<Modal>` e um estado só
(`candidatoEmEscolha`): o de busca fica com `show={aberto && !candidatoEmEscolha}`, o de
quantidade com `show={aberto && !!candidatoEmEscolha}` — nunca os dois abertos ao mesmo tempo,
e cancelar no passo de quantidade (`onFechar` limpa só `candidatoEmEscolha`) volta pro modal de
busca sozinho, de graça, sem precisar de um estado de "etapa" à parte.

## Editar a quantidade de um item já lançado

Cada item da refeição tinha só "remover" — pra mudar a quantidade era preciso remover e
lançar de novo. Agora, quando `RefeicaoCard` recebe `onEditarQuantidadeItem(itemId,
quantidadeG)` (só o Dia passa; o Plano não), cada item vira um `ItemAlimentoEditavel`
(`components/ItemAlimentoEditavel.jsx` — o mesmo componente usado na cesta da Substituição,
ver [04](04-substituicao.md)) em vez da linha estática antiga. Reorganizado assim, de cima pra
baixo:

1. **Nome do alimento em destaque** (`fw-700`, tamanho maior) — antes era texto comum e
   sumia no meio do card.
2. **Dose original**, em texto discreto: `calorias_kcal`/`carboidratos_g` do próprio
   catálogo, direto — são literalmente os valores PARA a medida usual (não "por grama"), então
   não precisam de cálculo nenhum, só de não usar `item.quantidadeG` (o que já foi ajustado).
3. Os campos editáveis (`QuantidadeDupla` — gramas e múltiplos da medida usual, os dois
   sincronizados).
4. **"Nessa quantidade"**, com bem mais destaque (negrito, cor de texto normal em vez de
   `text-muted`) que a dose original — os valores calculados na quantidade que está de fato
   nos campos acima.
5. Um separador, os **marcadores de kcal e CHO** (vermelho "excede"/verde "sobra",
   **separados por eixo** — igual `CandidatoOrcamentoItem`, ver [04](04-substituicao.md)), e a
   frase de conclusão: `"Respeitando {calorias e/ou carboidratos}, pode chegar até {X}."` —
   `fraseRespeitar()` em `domain/substituicao.js` monta "calorias e carboidratos" / "calorias"
   / "carboidratos" conforme os toggles, ou `null` (a seção some) se nenhum eixo é respeitado.

O "até quanto pode chegar" continua sendo o **total** que esse item poderia ter (não "quanto
mais"): `usoOutros` é a soma dos **outros** itens da mesma refeição (`calcularTotalItens`
excluindo esse), e `orcamento` é a meta da refeição inteira — passados pro
`ItemAlimentoEditavel` como props, que por baixo chama `quantidadeMaximaParaItem`
(`domain/substituicao.js`). Isso deixa visível, na hora de editar, por que um item específico
já está "estourando" — ex: a meta de CHO da refeição é 12 g e esse alimento sozinho permitiria
até 40,4 g antes de passar, mas está lançado com 64 g.

## Contraste e separação entre alimentos

Card (branco) contendo sugestões do plano, itens já lançados e a lista de candidatos por
orçamento ficava "branco sobre branco" — difícil notar onde uma seção acaba e a outra começa,
e pior ainda quando havia mais de um alimento na mesma lista (sem nada os separando com
clareza). A correção, em `index.css`: **toda** lista de alimentos — itens já lançados, cesta,
sugestões do plano e a lista de candidatos por orçamento (`ListaPaginada`, ver
[04](04-substituicao.md)) — usa o mesmo par de classes. `.lista-itens-refeicao` é o fundo
cinza-claro com borda que isola o bloco do card/modal branco por trás; dentro dele, cada
alimento é seu próprio **cartão branco** (`.item-alimento-editavel`, com borda e cantos
arredondados), em coluna com espaço entre eles — nunca linhas de uma `ListGroup`. Um cartão
branco sobre fundo cinza deixa óbvio, de relance, quantos alimentos existem na fila, mesmo sem
ler o conteúdo. Os cartões clicáveis (sugestões, candidatos) só ganham a classe extra
`.clicavel` (cursor + destaque de hover) — mesmo cartão, mesma base visual dos que já foram
lançados. `.subsecao` continua existindo só pros grupos "Alimentos do plano"/"Alimentos
adicionados" do passo 1 da Substituição (esses continuam `ListGroup`, com um toggle por linha,
não um cartão clicável inteiro).

## Item recém-adicionado: destaque + rolagem

Depois de clicar num candidato (ou numa sugestão do plano), o cartão correspondente na lista
de itens já lançados (ou na cesta, na Substituição) ganha um badge **"novo"** e uma borda azul
(`.item-alimento-novo`), e a página rola até ele (`scrollIntoView({ behavior: 'smooth', block:
'center' })`) — sem isso, adicionar algo enquanto a lista de itens já está longa deixava o
usuário sem saber onde o item foi parar, ou se o clique tinha funcionado.

Só um por vez ("`recemAdicionadoId`") e some sozinho depois de 1 minuto: os dois hooks de
"adicionar item" (`useRefeicoesDoDia.adicionarItem`/`adicionarItens`,
`usePlanoNutricional.adicionarItem`) passaram a devolver o id do item **de forma síncrona**
(gerado antes de chamar `persistir`, que continua assíncrono por baixo) — só assim quem chama
sabe qual id destacar sem esperar a gravação terminar. O estado `recemAdicionadoId` mora na
**página** (`RefeicoesDoDia.jsx`/`PlanoNutricional.jsx`), não no card de cada refeição, porque
só pode existir um destaque na tela inteira, não um por refeição — um único `useEffect`
(`setTimeout` de 60s + `scrollIntoView` num `requestAnimationFrame`) cuida dos dois casos:
sua própria limpeza cancela o timer anterior sempre que o id muda, o que já resolve "só um por
vez" de graça. Na Substituição, o mesmo padrão vive local ao componente (a cesta é interna ao
modal), destacando por `alimentoId` em vez de `id` de item (a cesta não tem id próprio).
