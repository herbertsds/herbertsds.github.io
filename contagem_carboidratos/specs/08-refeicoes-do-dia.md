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

Se o plano ganhar um tipo novo depois (ex: o usuário adiciona "Ceia"), ele já aparece
(virtualmente) em qualquer dia que for renderizado dali pra frente — não precisa de nenhuma
migração, já que a lista exibida é sempre recalculada a partir do plano atual.

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
