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
- **Meta da refeição** (dentro de cada `RefeicaoCard`, só nas Refeições do Dia): prop `resumo`
  do `RefeicaoCard`, renderizado logo após o cabeçalho (só o tipo) — a única coisa que
  continua visível mesmo com a refeição colapsada (ver [08](08-refeicoes-do-dia.md)). Também é
  onde mora o horário registrado da refeição, via a prop `extra` (ver abaixo) — não no
  cabeçalho do card, pra esse poder ser clicado em qualquer ponto pra colapsar.
  No Plano Nutricional esse prop não é usado — lá não existe "consumido", só a meta em si (a
  linha de total simples que já existia continua, via `totalLabel`).
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
`MedidorNutricional` internos (um por eixo) — sem frase nenhuma quando nem uma nem outra é
passada (ex: "Total da refeição (meta)" no Plano, que nem usa `ResumoNutricional`).

## `extra` — conteúdo livre ao lado do título

`ResumoNutricional` aceita uma prop `extra` (nó React qualquer), renderizada numa linha junto
com `titulo`, à direita. Hoje o único uso é o horário registrado da refeição
(`RefeicaoDoDiaCard.jsx`): o `<input type="time">` + "registrado" que antes ficava no
cabeçalho do `RefeicaoCard` mudou pra cá quando o cabeçalho virou colapsável (ver
[08](08-refeicoes-do-dia.md)) — um `<input>` no meio de uma barra inteira clicável ia
disputar o clique com o colapso, então saiu de lá. Como o card de Meta fica **fora** do
`Collapse` (sempre visível), o horário continua sempre alcançável mesmo com a refeição
recolhida.

## Por que não é um "hero" único por tela (como a regra de data-viz sugeriria)

A recomendação geral de dashboard é ter uma única figura-hero por view. Aqui, cada refeição
tem seu próprio orçamento e precisa do próprio medidor — por isso o padrão adotado é
"hero do dia maior, heróis de refeição um degrau menor" (`tamanho="grande"` vs. padrão), em vez
de um único número na tela inteira.
