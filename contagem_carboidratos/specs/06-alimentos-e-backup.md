# Tela de Alimentos (catálogo) e Backup (importar/exportar)

## Alimentos: editar o catálogo

Alguns valores do manual da SBD podem estar errados. A seção **Catálogo** da tela deixa buscar
qualquer item (mesmo algoritmo de busca de sempre) e editar: nome, medida usual, peso da medida
(em gramas — a interface nunca mostra "ml", ver [02](02-modelo-de-dados-e-persistencia.md)),
calorias e carboidratos.

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
  para adicionar algo **novo** a uma refeição, e na lista da tela de Alimentos (ver "Destaque
  na tela" abaixo).
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

**Onde o `AlimentoQuantidadeModal` de verdade abre**: `RefeicaoCard` sabe renderizar uma busca
livre própria (`AlimentoBuscaInput` + esse modal), mas as duas telas que o usam
(`RefeicaoDoDiaCard.jsx` e `RefeicaoPlanoCard.jsx`) sempre passam `ocultarBuscaLivre` — esse
caminho nunca roda na prática. Quem abre o modal de verdade é `BuscarAlimentoModal` (o modal de
busca por trás do botão "+ Adicionar alimento", em **ambas** as telas — ver
[08](08-refeicoes-do-dia.md)) e a lista "Sugestões do plano" dentro de `RefeicaoDoDiaCard.jsx`:
as três abrem o `AlimentoQuantidadeModal` **sempre** ao escolher um alimento, tenha variação
cadastrada ou não — é o próprio modal quem
decide se mostra o seletor (não mostra nada quando `variacoes` vem vazio). **Bug real,
corrigido**: antes de ficar assim, só abria o modal quando o alimento TINHA variação
(`variacoesPorBase.get(alimentoId)`) — qualquer outro lançava direto na medida usual, sem
chance de ajustar quantidade nem, antes disso ainda, de trocar de marca (não existia NENHUM
jeito de escolher variação, porque o único código que sabia mostrar o seletor — a busca livre
de `RefeicaoCard` — estava sempre oculto). O modal aceita uma prop opcional
`quantidadeInicial` (a quantidade planejada/testada de quem abriu, em vez da medida usual) —
só vale enquanto "Padrão" estiver selecionado; trocar pra uma variação volta a usar a medida
usual dela.

**Só nas Refeições do Dia, nunca no Plano**: o seletor de variação só é passado quando
`RefeicaoCard`/`BuscarAlimentoModal` recebem `permitirVariacoes`/`variacoesPorBase` (feito em
`RefeicoesDoDia.jsx`/`RefeicaoDoDiaCard.jsx`, não em `RefeicaoPlanoCard.jsx`) — o plano registra
o que foi receitado de forma genérica, a escolha de marca é um detalhe do que foi realmente
comprado/comido no dia. Por isso o `BuscarAlimentoModal` do Plano é chamado sem essas duas
props: `variacoesPorBase` vem `undefined`, e o próprio modal já trata isso como "nenhuma
variação" (`variacoesPorBase?.get(...) ?? []`).

## Destaque na tela: tudo na mesma lista, com filtros

Antes existia uma seção "Meus alimentos" separada, no topo, listando só editados/adicionados
(sem busca nem filtro); o resto da tela era uma busca à parte no catálogo base, que excluía os
adicionados de propósito. **Mudou**: agora é uma lista só, com um campo de busca e três
checkboxes de filtro (`editado`, `adicionado`, `comVariacoes`) por cima — editados e
adicionados aparecem misturados com o resto do catálogo, na ordem normal de busca/paginação, e
o badge (`editado` em amarelo, `adicionado` em azul) mais a "quantidade de variações" no card
são o que sinaliza cada um, não a posição na tela.

Os três filtros são **um conjunto** (`Set` de chaves ligadas), não um seletor único: nenhum
ligado mostra tudo (todo o catálogo, editados, adicionados, com ou sem variação — sem
distinção); um ou mais ligados mostra a **união** dos que batem com qualquer um deles (OU
lógico, não E) — marcar `editado` + `adicionado` junto mostra os dois tipos misturados, não a
interseção (que aliás seria sempre vazia, já que um alimento nunca é os dois ao mesmo tempo: um
customizado não passa pela camada de overrides). `comVariacoes` é computado a partir do mesmo
`Map` de contagem de variações por alimento base já usado pro badge "X variação(ões)"
(`contagemVariacoesPorBase`) — não é sobre alimentos que SÃO variação (esses nunca aparecem
nessa lista, ver acima), é sobre alimentos que TÊM pelo menos uma.

**O filtro roda sobre o resultado inteiro da busca, antes de paginar** (`buscarAlimentos(...,
alimentos.length)`, sem limite arbitrário, igual ao padrão já usado no `BuscarAlimentoModal`) —
se o filtro cortasse depois de um corte de busca já limitado, um item que bate no filtro mas
ficou fora do topo do ranking de busca sumiria sem explicação. A lista renderiza com
`ListaPaginada` (10 por página), cujo `resetKey` inclui a busca **e** o conjunto de filtros
ordenado (`[...filtrosAtivos].sort().join(',')`) — trocar qualquer um dos dois volta pra página
1, senão a paginação podia ficar apontando pra uma página que não existe mais no novo
resultado.

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

### Apagar dados

Mesma tela, seção separada, com o mesmo conjunto de categorias (Planos/Refeições/Alimentos) —
mas com **seleção própria** (`selecionadasApagar`, tudo desmarcado por padrão, diferente dos
toggles de exportar que já vêm todos marcados) e um botão vermelho ("Apagar selecionados") só
habilitado com pelo menos uma categoria marcada. `localStorageAdapter.apagarCategoria(categoria)`
remove todas as chaves daquela categoria (reaproveita `chavesDaCategoria`, a mesma função usada
por exportar/importar). Sempre pede confirmação num modal antes (nomeando as categorias
selecionadas), porque não tem volta — nenhum "desfazer". Depois de apagar, mesmo botão
"Recarregar página" do fluxo de importação (os hooks têm o dado antigo em memória).

## Campos de entrada em mobile

Dois ajustes que valem para qualquer input de texto/número do app (busca, formulário de
alimento, quantidade de uma refeição):

- **Fechar o teclado ao confirmar**: `enterKeyHint` (`"done"` nos campos comuns, `"search"` nas
  buscas) faz o teclado virtual mostrar um botão de confirmação em vez de "próximo"/nada; o
  handler `fecharTecladoNoEnter` (`src/utils/teclado.js`) tira o foco do campo (`blur()`) quando
  esse Enter é pressionado, fechando o teclado. Não é aplicado no Typeahead de busca de
  alimento (`AlimentoBuscaInput`) além do `enterKeyHint` — lá o Enter já tem uma função (escolher
  o item destacado no menu) que não pode ser sobrescrita.
- **Campo numérico sem "0" preso**: `CampoNumerico` (`src/components/CampoNumerico.jsx`)
  substitui `<Form.Control type="number">` nos campos de gramas/quantidade/calorias/
  carboidratos. Usa `type="text"` + `inputMode="decimal"` em vez de `type="number"` (no iOS o
  teclado numérico de `type=number` não tem um jeito nativo de fechar; `inputMode` dá o mesmo
  teclado, mas com a barra "Concluído"). Guarda o texto digitado num estado próprio, separado do
  valor numérico do componente pai: apagar tudo deixa o campo vazio (não reexibe "0" na hora), e
  só quando o campo perde o foco (ou quando o valor muda por fora — ex: o campo de "Gramas" e o
  de "Qtd." em `QuantidadeDupla` se recalculando um ao outro) o texto é resincronizado com o
  valor formatado. Usado em `QuantidadeDupla`, `AlimentoFormModal` e `AlimentoVariacoesModal`.
  A resincronização é bloqueada por "está sendo editado" (`editando`, ligado só no `onChange` —
  na digitação de verdade), não por "está focado": um `autoFocus` (ex: o campo "Gramas" do
  `AlimentoQuantidadeModal`) dispara o foco do navegador antes de um valor inicial assíncrono
  terminar de chegar (`quantidadeInicial`, ver seção de variações acima); se o gate fosse só
  foco, o campo ficaria travado no valor velho assim que fosse focado, mesmo sem a pessoa ter
  digitado nada — bug real, pego ao ligar o seletor de variação numa sugestão do plano (o campo
  "Gramas" ficava em 0 enquanto "Qtd." — sem `autoFocus` — mostrava o valor certo).
