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
um navegador/dispositivo para outro. Fica toda em `localStorageAdapter`, sem depender de saber
os nomes das chaves de cada repository:

- `exportarTudo()` varre todas as chaves do `localStorage` com o prefixo do app e devolve um
  objeto `{ chave: valor }`. Isso inclui automaticamente qualquer repository novo que apareça
  no futuro (plano, refeições de cada dia, overrides de alimentos) sem precisar atualizar essa
  função.
- **Exportar** serializa esse objeto com `JSON.stringify` e copia para a área de transferência
  (`navigator.clipboard.writeText`).
- **Importar** cola o texto, faz `JSON.parse` e grava cada chave de volta
  (`importarTudo`). Se `possuiAlgumDado()` disser que já existe algo salvo, mostra um modal de
  confirmação antes de sobrescrever — a importação substitui tudo, não faz merge.
- Depois de importar, é preciso recarregar a página — os hooks já montados (plano, alimentos,
  refeições do dia) têm o dado antigo em memória e não ficam observando o localStorage.
