# Busca e ranking de alimentos

## Requisito

Uma caixa de busca reaproveitada em todo o app (adicionar alimento numa refeição, cesta de
substituição). Duas exigências específicas:

1. Não precisa ser substring exata: buscar "leite integral" deve achar "Leite de vaca
   integral" (a query não é um prefixo contíguo do nome).
2. Precedência para quem **começa** com a string pesquisada, sobre os demais resultados.

## Implementação (`src/domain/busca.js`)

Usa [Fuse.js](https://fusejs.io) em modo **extended search**. Cada alimento é indexado por uma
versão normalizada do nome (`_busca`: minúsculo, sem acento — `normalizarTexto`, via
`String.normalize('NFD')` + remoção de diacríticos). A consulta também é normalizada e
quebrada em tokens por espaço; cada token vira uma condição `'token` (o `'` do extended search
= "deve conter esse texto exatamente", sem fuzziness). Condições separadas por espaço são
combinadas com **E lógico** pelo próprio Fuse — por isso `'leite 'integral` exige que "leite" e
"integral" apareçam os dois na string, em qualquer ordem/posição, sem exigir que sejam
contíguos. É isso que faz "leite integral" bater em "Leite de vaca integral".

Depois que o Fuse devolve os resultados (com `includeScore: true`), um pós-processamento
reordena: itens cujo nome normalizado **começa com** a query normalizada (`startsWith`) vão
para o topo; dentro de cada grupo (prefixo / não-prefixo), a ordem é pelo score do Fuse (menor
= mais relevante).

```js
buscarAlimentos(alimentos, consulta, limite = 30)
```

Sem consulta (string vazia), devolve os primeiros `limite` alimentos do catálogo — usado para a
lista inicial antes do usuário digitar.

## Por que não o filtro padrão do Typeahead

`react-bootstrap-typeahead` tem seu próprio `filterBy`, mas ele não faz token-AND nem prefixo
com a precedência que o requisito pede. Por isso todo uso do `Typeahead` no catálogo de
alimentos passa `filterBy={() => true}` (desliga o filtro dele) e usa `buscarAlimentos` para
gerar a lista de `options` a cada mudança na consulta — o Typeahead vira só a casca visual
(dropdown, teclado, acessibilidade), o ranking é nosso.
