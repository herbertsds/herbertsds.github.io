# Tela de Alimentos (catálogo) e Backup (importar/exportar)

## Alimentos: editar o catálogo

Alguns valores do manual da SBD podem estar errados. A seção **Catálogo** da tela deixa buscar
qualquer item (mesmo algoritmo de busca de sempre) e editar: nome, medida usual, peso/volume da
medida (g ou ml), calorias e carboidratos.

A edição **não reescreve** `app/public/alimentos.json` (é um arquivo estático do build, o
navegador não pode gravar nele). Em vez disso, cada edição vira um "override" salvo em
localStorage, por id de alimento (`alimentosOverridesRepository`, chave `alimentos_overrides`).
`alimentosRepository.getAll()` aplica os overrides por cima do JSON base a cada leitura, e
marca o resultado com `_editado: true` — usado só para exibir o badge, não é salvo em lugar
nenhum. "Reverter edição" chama `alimentosOverridesRepository.remover(id)`: o item volta a
mostrar exatamente o que está no JSON original.

Detalhe: se o usuário zerar o peso/volume ao editar (ou ao criar, ver abaixo), o item vira
`quantidade_indefinida: true` automaticamente — mesma regra dos 85 itens que já vêm assim do
PDF original (ver [02](02-modelo-de-dados-e-persistencia.md)).

## Alimentos: criar um que não existe no catálogo

Botão **+ Alimento** abre o mesmo formulário (`AlimentoFormModal`, `modo="criar"`), mas com o
nome editável e nenhum alimento pré-selecionado. Vira um registro novo em
`alimentosCustomizadosRepository` (chave `alimentos_customizados`, um array), com id gerado
(`custom_...`) e marcado `_adicionado: true` na leitura.

### Excluir um alimento criado é soft-delete

Apagar um alimento **adicionado** não tira o registro do armazenamento — só marca
`excluido: true` nele. O motivo: uma refeição do plano ou de um dia já passado pode referenciar
esse `alimentoId`, e ela precisa continuar mostrando nome/valores corretamente mesmo depois.

Isso é resolvido em duas camadas:
- `alimentosRepository.getAll()` devolve **tudo**, inclusive excluídos — é o que
  `alimentosPorId` (usado pra resolver os itens já lançados numa refeição) usa em
  `PlanoNutricional`/`RefeicoesDoDia`.
- `alimentosRepository.getDisponiveis()` filtra os excluídos — é o que entra na busca/lista
  para adicionar algo **novo** a uma refeição, e na seção "Meus alimentos" da tela.
- O hook `useAlimentos()` expõe os dois: `alimentos` (disponíveis, para buscar/adicionar) e
  `todos` (tudo, para montar `alimentosPorId`).

Um alimento **editado** (override em cima do catálogo base) não tem esse problema — não dá pra
"excluir" um item do catálogo estático, só reverter a correção, então "Reverter edição" nunca
precisa de soft-delete.

## Variações de marca

Um mesmo alimento pode ter versões de marcas diferentes com valores diferentes (ex: "Pão de
forma integral" da Vigor vs. da Panco) — dá pra cadastrar isso para **qualquer** alimento, do
catálogo base ou customizado, pelo botão "Variações" ao lado de cada item na tela Alimentos
(`AlimentosVariacoesModal`).

Cada variação vira, na leitura (`alimentosRepository.getAll()`), um alimento completo por
conta própria: id gerado (`var_...`), nome composto (`"{nome do alimento base} ({nome da
variação})"`, recalculado a cada leitura — se o nome do base mudar, o nome da variação
acompanha), com seus próprios `medida`/`quantidade_g_ml`/`calorias_kcal`/`carboidratos_g` e
`_variacao: true` + `alimentoBaseId` marcados. Excluir uma variação é soft-delete, pelo mesmo
motivo dos customizados (uma refeição já lançada pode estar usando o id dela diretamente).

**Onde ela aparece — só no seletor, nunca na busca**: `getDisponiveis()` (o que alimenta a
busca/lista pra adicionar algo novo) filtra `_variacao` fora, então variações nunca poluem os
resultados de busca. Elas só ficam acessíveis através do seletor "Variação" dentro do
`AlimentoQuantidadeModal` — que aparece quando o alimento escolhido tem pelo menos uma
variação cadastrada, com "Padrão" (o próprio alimento) pré-selecionado. Trocar a variação
recalcula tudo (medida, gramas/quantidade padrão, kcal/CHO) para os valores dela, e o que
efetivamente entra na refeição — `onConfirmar(alimentoId, quantidade)` — é o id da variação
escolhida, não o do alimento base. Como cada variação já é um alimento completo em
`alimentosPorId`, nenhum outro lugar do app (cálculo, exibição na lista da refeição, busca de
substituição) precisa saber que ela é "uma variação de algo" — é só mais um alimento.

**Só nas Refeições do Dia, nunca no Plano**: o seletor de variação só é passado quando
`RefeicaoCard` recebe `permitirVariacoes` (feito em `RefeicoesDoDia.jsx`, não em
`PlanoNutricional.jsx`) — o plano registra o que foi receitado de forma genérica, a escolha de
marca é um detalhe do que foi realmente comprado/comido no dia.

## Destaque na tela

A seção "Meus alimentos" no topo lista só o que é `_editado` ou `_adicionado` (e não
excluído), com um badge diferenciando os dois (`editado` em amarelo, `adicionado` em azul) e a
ação certa por tipo — "Reverter edição" para editados, "Excluir" para adicionados. O restante
da tela é a busca normal no catálogo base (sem os customizados, que já têm a seção própria).

Como o catálogo é carregado uma vez e cacheado em memória (`alimentosRepository`), qualquer
escrita (editar, reverter, criar, excluir) invalida esse cache; o hook `useAlimentos` expõe
`recarregar()` para os componentes pedirem os dados atualizados sem precisar de um reload de
página.

## Backup (Importar/Exportar)

Solução deliberadamente temporária enquanto o app não tem um backend — para levar os dados de
um navegador/dispositivo para outro. Três categorias — Planos, Refeições, Alimentos —, porque
o usuário nem sempre quer levar tudo: às vezes só o plano mudou de dispositivo, às vezes só o
catálogo foi editado.

Tudo fica em `localStorageAdapter`, sem os repositories saberem nada sobre backup. Cada
categoria reconhece as próprias chaves por nome/prefixo (`CATEGORIAS` em
`localStorageAdapter.js`): `planos` → `plano_nutricional`; `refeicoes` → tudo que começa com
`refeicoes_do_dia:`; `alimentos` → `alimentos_overrides`, `alimentos_customizados` e
`alimentos_variacoes`.

### Exportar: toggles + um payload só

`ImportarExportar.jsx` tem um `Form.Check` por categoria (todas marcadas por padrão); o botão
**Exportar** junta as chaves de cada categoria marcada (`exportarCategoria`) num payload só —
`{ categorias: ['planos', ...], dados: { <chave>: <valor> } }` — e copia pra área de
transferência (`navigator.clipboard.writeText`). O array `categorias` viaja junto porque é ele
quem diz, na hora de importar, o que fazer com cada chave — sem ele não daria pra saber se uma
chave de refeição faz parte de um backup que só devia mexer no plano.

### Importar: um botão só, lê a área de transferência sozinho

Nada de colar texto: o botão **Importar** chama `navigator.clipboard.readText()` direto. Erros
tratados explicitamente (nunca uma tela quebrada silenciosa):
- Falha ao ler a área de transferência (permissão negada, vazia) → erro.
- Texto não é JSON, ou não tem `categorias` (array) + `dados` (objeto) → "não é um backup
  válido".

Pra cada `categoria` do payload:
- **Planos/Refeições**: substituem, como antes (`importarCategoria`, que agora filtra `dados`
  pelas chaves da própria categoria — necessário porque `dados` pode vir com chaves de outras
  categorias juntas no mesmo payload). Se já existe algo salvo numa dessas categorias, um modal
  confirma antes (`possuiDadosDaCategoria`) — Alimentos nunca entra nessa checagem, porque não
  sobrescreve, faz merge.
- **Alimentos**: nunca substitui — faz **merge** (`domain/mergeAlimentos.js`,
  `mesclarAlimentos`). Compara cada uma das três coleções (o mapa de overrides por id; as
  listas de customizados/variações por id) contra o que já está salvo: o que só existe de um
  lado entra direto; o que existe dos dois lados com o **mesmo** conteúdo nem conta como
  conflito; só entra em conflito quando o mesmo id tem conteúdo diferente dos dois lados. Sem
  conflito nenhum, grava direto. Com conflito, abre um modal listando cada um (rótulo = nome do
  alimento/variação) com rádio "Manter o meu" / "Manter o importado", mais dois atalhos em
  massa ("Manter todos os meus" / "Manter todos os importados") — `aplicarResolucoes` aplica as
  escolhas em cima do resultado já mesclado (que, pros conflitos ainda não resolvidos, vale
  "meu" até a pessoa decidir).

Depois de importar, é preciso recarregar a página — os hooks já montados (plano, alimentos,
refeições do dia) têm o dado antigo em memória e não ficam observando o localStorage; o botão
"Recarregar página" só aparece depois de uma importação de verdade (não depois de exportar).
