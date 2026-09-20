# Exibição de meta vs. consumido (calorias e carboidratos)

## Por que isso importa mais que o resto

É a informação que o app inteiro existe para mostrar: quanto ainda posso comer hoje, e quanto
já passei. Por isso é sempre a **primeira coisa visível**, tanto na página (Refeições do Dia)
quanto dentro de cada card de refeição — antes até da lista de itens.

## Componentes

- `MedidorNutricional` (`src/components/MedidorNutricional.jsx`): um medidor de um eixo só
  (calorias OU carboidratos). Mostra, nessa ordem: rótulo, o **número grande** no formato
  `consumido/meta unidade` (ex: "450/605 kcal"), a **porcentagem** menor logo abaixo, e uma
  barra de progresso — número e barra na mesma cor da escala (ver abaixo).
- `ResumoNutricional` (`src/components/ResumoNutricional.jsx`): título + os dois medidores
  (Calorias, Carboidratos) lado a lado. Prop `tamanho="grande"` deixa o número ainda maior —
  usada só no total do dia (o "hero" da página); os demais usos ficam no tamanho padrão.
- `ResumoMetaRefeicao` (`src/components/ResumoMetaRefeicao.jsx`): a versão "só meta" — usada
  onde não existe "consumido" pra comparar (Plano Nutricional, impressão do plano). Reaproveita
  as mesmas classes CSS (`.resumo-nutricional`, `.medidor-numero`...) pra ficar do mesmo
  tamanho/peso visual do `ResumoNutricional`, mas sem número duplo, sem % e sem barra — só o
  valor da meta em si, grande. Props opcionais `mostrarKcal`/`mostrarCho` (default `true` nos
  dois) escondem um dos dois eixos — só usadas pela impressão (ver abaixo).
- `ImprimirPlanoModal` (`src/components/ImprimirPlanoModal.jsx`): modal que junta nome da
  pessoa + os dois toggles de eixo antes de imprimir o plano (ver "Impressão do plano" abaixo).

## Escala de cor (contínua, não por faixas)

`percentual = consumido / meta`, e a cor é **interpolada** (não são 3 estados fixos com salto
brusco entre eles) em três paradas, todas na porcentagem consumida:

| Paradas | 0% | 50% | 100%+ |
|---|---|---|---|
| Cor | verde `rgb(12,163,12)` | amarelo `rgb(250,178,25)` | vermelho `rgb(208,59,59)` |

Entre 0–50% interpola verde→amarelo; entre 50–100% interpola amarelo→vermelho; acima de 100%
fica cravado no vermelho (a porcentagem em texto continua subindo — "128%" — mas a cor não
fica "mais vermelha que vermelho"). Implementado em `corDaEscala()` dentro do próprio
`MedidorNutricional.jsx` (interpolação linear em RGB, não é CSS gradient — o valor calculado
também pinta o texto do número/porcentagem, não só a barra).

A trilha (fundo) da barra é a mesma cor da escala misturada com 80% de branco
(`misturarComBranco`) — muda de tom junto com o preenchimento, então o estado se lê pela barra
inteira, não só pelo trecho preenchido. A barra em si nunca ultrapassa 100% de largura
visualmente (`Math.min(percentual, 1)`), mesmo quando o valor real passa disso.

## Onde aparece

- **Total do dia** (`RefeicoesDoDia.jsx`): logo abaixo da navegação de data, antes de
  "Refeições do dia" — o primeiro bloco da página, tamanho grande.
- **Meta da refeição** (dentro de cada `RefeicaoCard`, nas duas telas): prop `resumo` do
  `RefeicaoCard`, renderizado logo após o cabeçalho (só o tipo) — some junto com o resto do
  conteúdo quando a refeição está colapsada, então só aparece com o card aberto (ver
  [08](08-refeicoes-do-dia.md); já foi diferente — ver "Refeições colapsadas" lá). Também é
  onde mora o horário, via a prop `extra` (ver abaixo), enquanto aberto — não no cabeçalho do
  card, pra esse poder ser clicado em qualquer ponto pra colapsar; fechado, o horário volta pro
  cabeçalho. Nas Refeições do Dia é `ResumoNutricional` (consumido vs. meta); no Plano
  Nutricional é `ResumoMetaRefeicao` (só a meta — não existe "consumido" ali, o plano **é** a
  meta) com o horário fixo do plano em `extra`.
- **Total do plano** (`PlanoNutricional.jsx`): mesmo lugar/tamanho que o "Total do dia" das
  Refeições (primeiro bloco da página, `tamanho="grande"`), também com `ResumoMetaRefeicao`.
- **Cesta / orçamento da substituição** (dentro do modal de Sugestão de Substituição, ver
  [04](04-substituicao.md)): mesmo componente, `tamanho="compacto"`, mas com uma frase
  explicativa diferente (ver abaixo) — não é "consumido vs. meta", é "soma dos alimentos já
  escolhidos vs. orçamento dos que serão substituídos".

## Frase explicativa abaixo do número

Desde que o app passou a ter vários lugares com "número grande + %", ficou fácil perder o que
o número realmente significa — por isso cada medidor ganhou uma frase curta logo abaixo da
barra (`.medidor-explicacao` no CSS), ajustada por eixo (calorias/carboidratos) e por
contexto:

- **Padrão** ("consumido vs. meta" — Total do dia, Meta da refeição): prop `contexto`
  ("no dia" / "nessa refeição") monta a frase sozinha, sem precisar que quem chama escreva
  nada — `"Você ainda pode comer {resto} kcal {contexto}."` quando ainda cabe, ou
  `"Você já passou {resto} kcal da meta {contexto}."` quando não cabe mais (mesma lógica pros
  dois eixos, só troca "kcal" por "g de carboidratos").
- **Customizado** (qualquer outro significado — ex: a cesta da Substituição): prop
  `textoExplicativo`, uma função `({ consumido, meta, restante, unidade, rotulo }) => string`
  que substitui a frase padrão inteira. A cesta usa isso pra dizer
  `"Soma das calorias/dos carboidratos dos alimentos já colocados na cesta."` — não faz
  sentido "você ainda pode comer" ali, já que não é uma meta de consumo, é um orçamento de
  substituição.

As duas props (`contexto`/`textoExplicativo`) passam de `ResumoNutricional` direto pros dois
`MedidorNutricional` internos (um por eixo). `ResumoMetaRefeicao` (Plano) não usa nada disso —
não tem frase explicativa nenhuma, porque não há "quanto falta" a explicar quando o número
exibido já é a própria meta.

## `extra` — conteúdo livre ao lado do título

`ResumoNutricional` aceita uma prop `extra` (nó React qualquer), renderizada numa linha junto
com `titulo`, à direita. Hoje o único uso é o horário registrado da refeição
(`RefeicaoDoDiaCard.jsx`): o `<input type="time">` + "registrado" que antes ficava no
cabeçalho do `RefeicaoCard` mudou pra cá quando o cabeçalho virou colapsável (ver
[08](08-refeicoes-do-dia.md)) — um `<input>` no meio de uma barra inteira clicável ia
disputar o clique com o colapso, então saiu de lá. O card de Meta (com esse `extra`) mora
**dentro** do `Collapse` — some com a refeição recolhida, e o horário some junto; nesse caso
`RefeicaoCard.jsx` mostra o horário de volta no próprio cabeçalho (ver "Onde o horário mora
agora" em [08](08-refeicoes-do-dia.md)).

## Impressão do plano (botão "Imprimir")

`PlanoNutricional.jsx` tem um botão "Imprimir" que abre `ImprimirPlanoModal` (não imprime
direto) perguntando duas coisas antes:
- **Nome da pessoa** (opcional): vira o título impresso "Plano Nutricional - {nome}" (sem o "-
  nome" quando fica em branco).
- **O que mostrar nos números**: dois `Form.Check type="switch"` independentes — Calorias e
  Carboidratos — não checkbox, pra combinar com o resto do app (Respeitar
  calorias/carboidratos na Substituição). Pelo menos um dos dois tem que ficar ligado (botão
  "Imprimir" do modal fica desabilitado com os dois desligados, com um aviso). Os dois vêm
  ligados por padrão.

Confirmando no modal, dispara `window.print()` — sem geração de PDF própria, é o diálogo
nativo do navegador (que em qualquer desktop/mobile moderno tem a opção "Salvar como PDF") — e
fecha o modal em seguida. **Não dá pra contar com o fechamento do modal pra tirar ele da
impressão**: `setState` é assíncrono, então `window.print()` roda com o modal ainda de verdade
no DOM (bug real, pego durante o desenvolvimento — a primeira versão tentava fechar antes de
imprimir via um estado auxiliar + `useEffect`, mas `window.print()` disparava antes do React
re-renderizar sem o modal, e ele saía na impressão por cima do conteúdo). A correção é em CSS,
não em timing: `.modal`/`.modal-backdrop` (classes do próprio react-bootstrap `Modal`, que
renderiza num portal direto no `<body>` — fora do `.no-imprimir` da página) somem via
`display: none !important` dentro do `@media print`, incondicionalmente, então não importa se
o modal ainda está tecnicamente aberto no estado React no instante em que a impressão
acontece.

O que sai impresso não é a tela normal (cheia de botões de editar/buscar/adicionar, que não
fazem sentido no papel): é um bloco à parte (`.somente-impressao`), escondido na tela
(`display: none`) e só mostrado via `@media print`, com exatamente o pedido — por refeição,
tipo + horário + os números grandes de meta (`ResumoMetaRefeicao`, sem "consumido", filtrado
pelos dois toggles via as props `mostrarKcal`/`mostrarCho`) — e o total do dia no fim, em
`tamanho="grande"`. Os toggles só afetam essa versão impressa; os mesmos números na tela
(`ResumoMetaRefeicao` do "Total do plano" e de cada "Meta da refeição") sempre mostram os dois
eixos, sem chamar essas props.

A troca de visibilidade acontece toda em CSS (`index.css`, seção "Impressão do Plano
Nutricional"): `.no-imprimir` (a tela normal, incluindo o cabeçalho `.app-header` e a navegação
inferior `.app-nav-inferior` do app inteiro) some, `.somente-impressao` aparece. Um detalhe que
quebraria a impressão se esquecido: o shell do app é `height: 100vh` + `overflow: hidden` com
scroll só na área de conteúdo (pensado pra tela, não pra papel) — em `@media print` isso vira
`height: auto` + `overflow: visible`, senão a impressão cortaria na altura de uma tela em vez
de sair a lista inteira.

## Por que não é um "hero" único por tela (como a regra de data-viz sugeriria)

A recomendação geral de dashboard é ter uma única figura-hero por view. Aqui, cada refeição
tem seu próprio orçamento e precisa do próprio medidor — por isso o padrão adotado é
"hero do dia maior, heróis de refeição um degrau menor" (`tamanho="grande"` vs. padrão), em vez
de um único número na tela inteira.
