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

## Fluxo

1. Dentro do modal, os alimentos aparecem em duas divisões, nessa ordem — **Alimentos do
   plano** primeiro, **Alimentos adicionados** depois — cada linha com um toggle "a
   substituir" mostrando gramas/quantidade **e** kcal/CHO (nunca só o nome).

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
   agrupadas. A lista de candidatos também mostra kcal/CHO de cada um (na quantidade
   testada) — não só o nome.
2. Dois toggles, ligados por padrão: **Respeitar calorias** / **Respeitar carboidratos** —
   controlam quais dos dois eixos entram na classificação de "excede" no passo 3.
3. Campo de busca (mesmo algoritmo de [03](03-busca-e-ranking.md)) filtra o catálogo inteiro
   em duas listas, recalculadas a cada mudança na cesta:
   - **Cabem no limite**: adicionar a medida usual desse alimento à cesta atual não estoura o
     orçamento (nos eixos marcados). Mostra kcal/CHO do acréscimo.
   - **Ultrapassam o limite**: estoura, com o badge mostrando exatamente quanto
     (`+X kcal +Y g CHO`) **e** a quantidade máxima que ainda caberia no orçamento — em gramas
     e em medidas usuais (`domain/substituicao.js`, `classificarCandidato` →
     `quantidadeMaximaG` / `quantidadeMaximaMedidas`, calculado dividindo o que resta do
     orçamento pela taxa kcal/CHO por grama do alimento, pegando o mais restritivo entre os
     eixos respeitados).

   A quantidade de teste usada na classificação é sempre a **medida usual** do alimento
   candidato — não é um "solver" de combinações, é feedback incremental sobre "se eu adicionar
   isso agora, o que acontece".
4. Enquanto isso, um medidor compacto (`ResumoNutricional tamanho="compacto"`, o mesmo
   componente de número grande + % + barra usado no resto do app) mostra **cesta / orçamento**
   — quanto já foi selecionado do total disponível para substituir, com a mesma escala de cor
   verde→amarelo→vermelho. É "compacto" de propósito: dentro desse modal tem muita outra
   informação (as duas divisões, os toggles, a busca, as duas listas de candidatos), então o
   número fica menor que o do "Total do dia"/"Meta da refeição".
5. Clicar num candidato adiciona à **cesta**, com gramas e quantidade editáveis (o mesmo
   componente `QuantidadeDupla` usado no resto do app — ver [02](02-modelo-de-dados-e-persistencia.md)).
6. Dois botões de aplicar, sem modal de confirmação no meio (ver "Por que dois botões" abaixo).
   Ficam num `Modal.Footer` **sempre visível** (o mesmo padrão header/conteúdo/footer da
   página, só que aqui é o `scrollable` do próprio `Modal` do react-bootstrap que faz o
   `Modal.Body` rolar enquanto header e footer ficam fixos — não precisou de CSS novo).
   Desabilitados até ter pelo menos um grupo marcado **e** algo na cesta:
   - **Substituir os itens marcados** — remove da refeição todas as linhas por trás dos
     grupos marcados (`itemIds` de cada grupo, achatado — vazio para um grupo do plano ainda
     não lançado, então nesse caso não remove nada) e adiciona os da cesta no lugar.
   - **Manter os itens e adicionar os novos** — não remove nada, só soma os da cesta.

Isso é deliberadamente **muitos-para-muitos**: quantos itens forem marcados para substituir, e
quantos substitutos forem escolhidos, sem relação 1-para-1 entre eles.

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
