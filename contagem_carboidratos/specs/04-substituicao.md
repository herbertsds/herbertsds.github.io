# Sugestão de Substituição

> Revisão: essa funcionalidade nasceu embutida no Plano Nutricional e depois foi movida para
> dentro da refeição do **dia** (não existe mais no Plano). A versão abaixo já reflete essa
> mudança — o motivo é simples: faz mais sentido substituir o que você realmente vai comer hoje
> do que reescrever a meta do plano.

## Onde vive

Um botão ("Sugerir substituição") dentro de cada refeição já lançada em **Refeições**
(`SugestaoSubstituicao`, renderizado como `extra` dentro de `RefeicaoCard` nessa página) abre
um **modal** — todo o fluxo abaixo acontece dentro dele. O escopo "uma refeição por vez" é
natural — os alimentos a substituir só podem vir da própria refeição do dia em questão.

## Fluxo em dois passos

O modal é dividido em dois passos — dois `Collapse` (react-bootstrap) dentro do mesmo
`Modal.Body`, nunca os dois abertos ao mesmo tempo — em vez de mostrar tudo de uma vez.
Motivo: quando as duas divisões de alimentos, os toggles, a cesta, a busca e as duas listas de
candidatos apareciam juntas, a tela ficava densa demais pra decidir "o que vou substituir"
antes mesmo de começar a buscar substitutos. Separar em **passo 1 — o que substituir** e
**passo 2 — buscar substitutos** deixa cada etapa com uma decisão só.

### Passo 1 — o que substituir

1. Os alimentos aparecem em duas divisões, nessa ordem — **Alimentos do plano** primeiro,
   **Alimentos adicionados** depois — cada linha com um toggle "a substituir" mostrando
   gramas/quantidade **e** kcal/CHO (nunca só o nome).

   "Alimentos do plano" inclui **todo alimento previsto no plano para essa refeição, mesmo
   que ainda não tenha sido lançado hoje** — nesse caso a linha usa a quantidade planejada
   (não a real, que ainda não existe) e marcá-la só define o orçamento; aplicar uma
   substituição nela não remove nada (não há o que remover), só adiciona os substitutos. Assim
   que o usuário lança de verdade um item do plano na refeição, a linha passa a refletir a
   quantidade real.

   As linhas são agrupadas por **alimento**, não por lançamento: se o mesmo alimento tem mais
   de uma linha na refeição (uma veio da sugestão do plano, outra foi adicionada solta, por
   exemplo), as quantidades somam numa linha só. Um alimento cujo id está no plano — pela
   sugestão previamente listada, por uma linha com origem `sugestao-plano`, ou mesmo uma linha
   `extra` que por acaso é o mesmo alimento do plano — **nunca** aparece em "Alimentos
   adicionados": ele sempre entra em "Alimentos do plano" (`montarGrupos` em
   `SugestaoSubstituicao.jsx`).

   Marcar um ou mais grupos define o **orçamento**: soma de kcal e de CHO das quantidades
   agrupadas.
2. Botão **Avançar** (desabilitado até marcar pelo menos um grupo) fecha esse `Collapse` e
   abre o do passo 2 — não recarrega nada, é só o mesmo estado (`grupos`, `cesta`, toggles)
   visto de outro jeito.

### Passo 2 — buscar substitutos

Um link "‹ voltar para escolher os alimentos" no topo reabre o passo 1 (mesma seleção,
toggles e cesta continuam como estavam — nada é limpo só por navegar entre os passos; só
trocar a seleção de grupos limpa a cesta, ver `alternarGrupo`).

1. Os dois toggles **Respeitar calorias** / **Respeitar carboidratos** (ligados por padrão)
   são a **primeira coisa** do passo 2, antes até do medidor de cesta/orçamento — controlam
   quais dos dois eixos entram na classificação de cada candidato logo abaixo. Moveram pra cá
   (antes ficavam no passo 1, junto dos grupos) porque é aqui, na hora de julgar os
   candidatos, que eles realmente importam.
2. Um medidor compacto (`ResumoNutricional tamanho="compacto"`, o mesmo componente de número
   grande + % + barra usado no resto do app) mostra **cesta / orçamento** — quanto já foi
   selecionado do total disponível para substituir, com a mesma escala de cor
   verde→amarelo→vermelho, e uma frase explicativa própria embaixo (`textoExplicativo` — ver
   [07](07-resumo-nutricional.md)): "Soma das calorias/dos carboidratos dos alimentos já
   colocados na cesta" — diferente da frase padrão ("você ainda pode comer"), porque esse
   número não é "consumido vs. meta", é "cesta vs. orçamento da substituição".
3. Campo de busca (mesmo algoritmo de [03](03-busca-e-ranking.md)) filtra o catálogo **inteiro**
   (sem limite artificial — `buscarAlimentos(alimentos, consulta, alimentos.length)`), e os
   controles de **filtro e ordenação** (`components/FiltroOrdenacaoCandidatos.jsx`, ver seção
   própria abaixo) refinam o resultado antes de virar uma **lista única**, recalculada a cada
   mudança na cesta, nos toggles, no filtro ou na ordenação — cada linha usa
   `components/CandidatoOrcamentoItem.jsx` (ver seção própria abaixo) pra mostrar nome, medida
   usual, os marcadores de kcal/CHO (verde "sobra" ou vermelho "excede") e a porção máxima que
   ainda caberia. Não existe mais separação em "Cabem no limite" / "Ultrapassam o limite" — a
   classificação já está nos marcadores de cada linha, então duas listas viraram redundância
   visual sem adicionar informação (o filtro cobre o mesmo caso de uso, sob demanda).

   A quantidade de teste usada na classificação é sempre a **medida usual** do alimento
   candidato — não é um "solver" de combinações, é feedback incremental sobre "se eu adicionar
   isso agora, o que acontece".

   A lista é **exaustiva, paginada em vez de scroll** (5 itens por página —
   `components/ListaPaginada.jsx`, ver seção própria abaixo). Antes, a lista cortava em 20/60
   resultados com `overflow-y: auto`; um alimento relevante mas fora do corte simplesmente não
   aparecia. Paginar em vez de cortar garante que todo resultado da busca é alcançável, só que
   em passos pequenos.
4. Clicar em qualquer candidato — cabe ou ultrapassa — adiciona à **cesta**, renderizada com
   `components/ItemAlimentoEditavel.jsx` (o mesmo componente usado pros itens já lançados numa
   refeição — ver [08](08-refeicoes-do-dia.md)): nome em destaque, dose original, os campos
   `QuantidadeDupla`, a dose "nessa quantidade" já em destaque maior, e os marcadores +
   "Respeitando X, pode chegar até Y" — aqui o `orcamento` passado pro componente é o
   orçamento da substituição (soma dos grupos marcados no passo 1), não a meta da refeição.
   Não bloquear quem ultrapassa ao adicionar é proposital: a decisão de estourar o orçamento é
   do usuário, o app só precisa deixar isso bem claro antes do clique (ver
   `CandidatoOrcamentoItem` abaixo), não impedir.
5. No fim do passo, uma **prévia** com menos destaque (fonte pequena, dentro de uma
   `.subsecao`) mostra como a refeição ficaria assumindo o clique em "Substituir os itens
   marcados": os itens da refeição que não seriam removidos + os da cesta (marcados como
   "(novo)"), e o total resultante comparado à **meta da refeição inteira** (não ao orçamento
   da substituição — por isso `SugestaoSubstituicao` agora recebe `meta` como prop, vinda de
   `RefeicaoDoDiaCard`). Só aparece quando há algo marcado pra remover ou algo na cesta — sem
   isso não haveria mudança nenhuma pra prever.

### Aplicar (footer, sempre visível nos dois passos)

Dois botões de aplicar, sem modal de confirmação no meio (ver "Por que dois botões" abaixo).
Ficam num `Modal.Footer` **sempre visível** (o mesmo padrão header/conteúdo/footer da
página, só que aqui é o `scrollable` do próprio `Modal` do react-bootstrap que faz o
`Modal.Body` rolar enquanto header e footer ficam fixos — não precisou de CSS novo), visíveis
tanto no passo 1 quanto no passo 2. Desabilitados até ter pelo menos um grupo marcado **e**
algo na cesta (na prática, só ficam clicáveis depois de avançar pro passo 2 e escolher algo):
- **Substituir os itens marcados** — remove da refeição todas as linhas por trás dos
  grupos marcados (`itemIds` de cada grupo, achatado — vazio para um grupo do plano ainda
  não lançado, então nesse caso não remove nada) e adiciona os da cesta no lugar.
- **Manter os itens e adicionar os novos** — não remove nada, só soma os da cesta.

Isso é deliberadamente **muitos-para-muitos**: quantos itens forem marcados para substituir, e
quantos substitutos forem escolhidos, sem relação 1-para-1 entre eles.

## `CandidatoOrcamentoItem` — a linha da lista, compartilhada

`components/CandidatoOrcamentoItem.jsx` renderiza uma linha de candidato — usado tanto na
lista única do passo 2 da Substituição quanto na lista de "o que cabe (e o que ultrapassa) na
meta" ao adicionar um alimento direto numa refeição (`AlimentosNoOrcamento.jsx`, ver abaixo).
Recebe um candidato já classificado (`classificarCandidato`, de `domain/substituicao.js`) e
mostra:

- Nome + medida usual, sempre — antes só aparecia nas linhas que cabiam; agora toda linha
  mostra, cabendo ou não. **Cada pedaço numa linha própria, sempre** (nome / medida / badges /
  kcal·CHO / "pode consumir"), nunca dividindo linha com quebra condicional
  (`flex-wrap` decidindo na hora conforme o nome coubesse ou não): antes, um nome curto e um
  nome longo produziam cards de alturas diferentes na mesma página — ao paginar
  (`ListaPaginada`), a lista "pulava" de altura de página em página. Com a estrutura fixa,
  todo card no mesmo contexto tem o mesmo número de linhas.
- **Kcal e CHO como marcadores separados** (antes vinham concatenados num badge só de texto):
  cada eixo respeitado (`respeitarCalorias`/`respeitarCarboidratos`) ganha um badge próprio —
  vermelho "+X kcal" / "+Y g CHO" quando esse eixo é ultrapassado, verde "-X kcal" / "-Y g
  CHO" quando não é (o valor é quanto **sobraria** daquele eixo depois de consumir a medida
  usual desse alimento — ex: 400 kcal disponíveis, alimento de 100 kcal na medida usual →
  badge verde "-300 kcal"). Um eixo não respeitado não ganha badge nenhum.
- Uma linha embaixo com **"pode consumir até"**: a quantidade máxima (em gramas + medidas
  usuais, ou só em medidas usuais pros alimentos de `quantidade_indefinida`) que ainda caberia
  no que resta do orçamento, respeitando os eixos marcados — calculada sempre, não só quando a
  medida usual ultrapassa (`domain/substituicao.js`, `classificarCandidato` →
  `quantidadeMaximaG`/`quantidadeMaximaMedidas`, agora computados incondicionalmente; e
  `restanteKcalDepois`/`restanteChoDepois` para os badges verdes). A linha some só quando não
  há teto real (nenhum eixo respeitado, ou o eixo respeitado tem taxa zero pra esse alimento —
  ex: um alimento com 0 kcal/g não tem limite por caloria).

Clicar na linha inteira aciona `onSelecionar(alimento, quantidadeTeste)` — quem chama decide o
que isso significa (adicionar à cesta, na Substituição; adicionar direto na refeição, ao
lançar um alimento novo).

## Filtro e ordenação (componente reaproveitado)

`components/FiltroOrdenacaoCandidatos.jsx` — dois `Form.Select`: um **filtro** (Todos / Só os
que cabem / Só os que ultrapassam) e uma **ordenação** (Sem ordenação / por calorias / por
carboidratos), com um botão pra alternar crescente/decrescente que só aparece quando alguma
ordenação está ativa. A lógica pura fica em `domain/substituicao.js`,
`filtrarEOrdenarCandidatos(candidatos, { filtro, ordenarPor, direcao })` — filtra por
`c.excede` e ordena por `acrescimoKcal`/`acrescimoCho` (os valores na medida usual, os mesmos
mostrados em cada linha). Usado tanto na lista da Substituição quanto na de "o que cabe na
meta" ao adicionar um alimento direto numa refeição — mesmo componente, estado local
(`useState`) em cada um dos dois lugares que o usa. A `resetKey` da `ListaPaginada`
correspondente inclui filtro/ordenação/direção além da busca, senão trocar de filtro podia
deixar a paginação apontando pra uma página que não existe mais no resultado filtrado.

## Lista paginada (componente reaproveitado)

`components/ListaPaginada.jsx` é uma paginação genérica (`itens`, `renderItem`,
`itensPorPagina`, `resetKey`) usada tanto na lista da Substituição quanto na de "o que cabe na
meta" ao adicionar um alimento direto numa refeição — as duas passam `itensPorPagina={5}`.
`resetKey` (a consulta de busca, na prática) volta a página pra 1 sempre que muda; sem isso,
trocar de busca podia deixar a paginação apontando pra uma página que não existe mais no novo
resultado.

## Cabe na meta — ao adicionar um alimento direto na refeição

A mesma ideia da Substituição (classificar candidatos contra um orçamento, com os toggles
Respeitar calorias/carboidratos) também ajuda **fora** do fluxo de substituição: ao adicionar
um alimento novo direto numa refeição do dia, `components/AlimentosNoOrcamento.jsx` mostra
numa lista única o que ainda cabe — e o que não cabe mais — no que **resta da meta daquela
refeição** (`meta - consumido`, nunca negativo).

Reaproveita `classificarCandidato` do mesmo jeito que a Substituição, só que comparando contra
o restante da própria refeição em vez de uma cesta (`usoAtual` fixo em `{ kcal: 0, cho: 0 }` —
cada clique adiciona direto, não acumula num carrinho), com a mesma `CandidatoOrcamentoItem` e
os mesmos controles de `FiltroOrdenacaoCandidatos` descritos acima. **Toda linha é clicável,
cabendo ou não** — clicar adiciona direto na refeição, na medida usual, do mesmo jeito que as
sugestões do plano; a decisão de estourar a meta é do usuário, o app só deixa o aviso (badge
vermelho + "pode consumir até") bem claro antes do clique, não impede.

Diferente da Substituição, os toggles Respeitar calorias/carboidratos **não pertencem a esse
componente** — são estado da refeição inteira (`RefeicaoDoDiaCard.jsx`, ver
[08](08-refeicoes-do-dia.md)), passados como prop, porque também aparecem fixos logo depois da
Meta da Refeição (ver "Ordem dos blocos" em [08](08-refeicoes-do-dia.md)).

## Por que dois botões em vez de um modal de conflito

Numa versão anterior (quando a substituição vivia no Plano), "aplicar" causava um modal de
conflito só quando o item já estivesse lançado no dia — porque o Plano e o Dia eram fontes de
dados diferentes. Agora que a substituição já opera **dentro da própria refeição do dia**, os
itens marcados para substituir sempre "já estão lá" por definição — não existe mais um caso de
"detectar" conflito, então a escolha vira só uma questão de intenção do usuário: remover ou não
os originais. Dois botões explícitos são mais diretos que reagir com um modal depois do clique.

## `useRefeicoesDoDia` — uma instância só, na própria página

Como a substituição mexe direto na refeição do dia (via `substituirItensNaRefeicao(refeicaoId,
idsParaRemover, novosItens)` do hook `useRefeicoesDoDia`), e essa é a mesma instância que a
página `RefeicoesDoDia` já usa para tudo mais, não há mais o risco (que existia quando a
substituição vivia no Plano) de duas cópias em memória do registro do dia se sobrescreverem — é
só uma leitura/escrita, no mesmo lugar.
