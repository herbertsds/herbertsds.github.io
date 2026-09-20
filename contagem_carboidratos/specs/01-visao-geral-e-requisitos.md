# Visão geral e requisitos

## Objetivo

Aplicação para controlar carboidratos e calorias no dia a dia, comparando com o que foi
receitado por uma nutricionista. Duas partes:

1. **Plano Nutricional**: o que foi receitado — refeições, alimentos e quantidades, com os
   totais funcionando como meta.
2. **Refeições do Dia**: o que foi realmente comido, dia a dia, comparado com a meta do plano.

Mais duas telas de apoio:
- **Alimentos**: corrigir dados do catálogo ou cadastrar alimentos que não estão nele.
- **Backup**: exportar/importar tudo que está salvo, solução temporária enquanto não há um
  backend de verdade.

E uma ferramenta auxiliar, disparada por um botão dentro de uma refeição já lançada em
**Refeições**: **Sugestão de Substituição**, para trocar um ou mais alimentos dessa refeição
por outros sem estourar o orçamento de calorias/carboidratos.

Navegação: 4 abas fixas — Refeições, Plano, Alimentos, Backup (`App.jsx`, array `ABAS`).

## Fonte de dados dos alimentos

O catálogo vem do manual de contagem de carboidratos da SBD
(`manual-contagem-carboidratos-web-1.pdf`), extraído por `extract_alimentos.py` (usa
`pdfplumber`) para `app/public/alimentos.json` — 2429 alimentos, cada um com `id`, `alimento`,
`medida` (medida caseira), `quantidade_g_ml`, `carboidratos_g`, `calorias_kcal`.

**Achado durante a extração**: 85 desses 2429 itens (todos de fast-food — "Batata frita
Burguer King®", "Batata fritas Mc' Donalds®" etc.) têm `quantidade_g_ml = 0` **no próprio
PDF original** — o manual não informa o peso da porção para eles. Esses itens ganham
`quantidade_indefinida: true` no JSON gerado. Ver [02](02-modelo-de-dados-e-persistencia.md)
para como isso afeta o cálculo.

Os créditos pela fonte dos dados (Manual de Contagem de Carboidratos, SBD) ficam visíveis no
próprio app — botão "ⓘ" ao lado do título (`InfoFonteDadosModal.jsx`) — e no
[`README.md`](../README.md) do projeto, que também define os termos de licença (código aberto
para uso pessoal; os dados de alimentos permanecem da SBD).

## CRUD de Refeição

Só existe no **Plano** (`RefeicaoFormModal`): tipo de refeição com os 7 padrões (Desjejum, Café
da Manhã, Colação, Almoço, Lanche da Tarde, Lanche da Noite/Jantar, Ceia) + opção de digitar
qualquer nome novo — um único `<input>` com `list` apontando pra um `<datalist>` nativo (sem
depender de nenhuma lib de typeahead): sugere os padrões e os já cadastrados no plano, mas
aceita qualquer texto digitado —, horário (`<input type="time">`), editar/excluir a refeição
inteira.

Em **Refeições** não existe mais criação manual — toda refeição do plano aparece
automaticamente em todo dia (ver [08](08-refeicoes-do-dia.md)); o que dá pra editar ali é
outra coisa: o horário em que ela foi de fato feita.

Em ambas: adicionar/remover alimentos dentro da refeição, com quantidade em dois campos
ligados, **gramas** e **quantidade** (múltiplo da medida usual) — editar um recalcula o outro
na hora (`QuantidadeDupla`). Para alimentos `quantidade_indefinida`, só existe o campo de
quantidade (porções).

## Busca de alimentos

Precisa: (1) achar por substring mesmo sem ser exatamente igual ao digitado (ex: "leite
integral" deve achar "Leite de vaca integral"), e (2) dar precedência a quem começa com a
string pesquisada. Ver [03](03-busca-e-ranking.md).

## Plano Nutricional

Cada refeição some seus alimentos (calorias e carboidratos) automaticamente conforme são
adicionados; o total do plano soma todas as refeições. Esses totais viram a **meta**.

## Refeições (do dia)

Uma entrada por data (sempre abre no dia atual, com navegação para dias anteriores). Toda
refeição do plano já aparece automaticamente, mesmo sem nada lançado ainda — não há passo de
criação manual. Cada card mostra os alimentos previstos daquele tipo como "sugestões" para
adicionar com 1 clique, além da busca livre para adicionar qualquer outro alimento, e um campo
de horário editável (o horário em que a refeição foi de fato feita, separado do horário
programado no plano). Consumido vs. meta (calorias e carboidratos), com o delta, tanto por
refeição quanto no total do dia. Detalhes em [08](08-refeicoes-do-dia.md).

## Sugestão de Substituição

Um botão dentro de cada refeição (em Refeições) abre um modal para trocar os alimentos dela.
Fluxo completo em [04](04-substituicao.md).

## Alimentos e Backup

Editar/criar alimentos do catálogo e exportar/importar os dados salvos. Fluxo completo em
[06](06-alimentos-e-backup.md).

## Requisitos não funcionais

- **SPA**: React + Vite, sem reload de página entre as duas áreas (troca de state, não de URL).
- **Mobile-first**: layout pensado e testado primeiro para tela pequena — navegação principal
  fixa no rodapé (alcance do polegar), listas sempre empilhadas (nunca tabela HTML), modais
  full-width em telas pequenas. Desktop é a adaptação secundária (breakpoint `md`, 768px).
- **Componentes prontos**: `react-bootstrap` (Modal, Form, Card, Accordion, Badge, Nav) e
  `react-bootstrap-typeahead` (select com opção de criar novo, busca com filtro customizado).
  Toggles (`Form.Check type="switch"`) em vez de checkbox tradicional para escolhas
  ligado/desligado.
- **Persistência em localStorage, mas isolada**: ver [02](02-modelo-de-dados-e-persistencia.md)
  — é o requisito mais importante do ponto de vista de manutenção futura.
- **Build via Docker efêmero**: ver [05](05-build-e-deploy.md).
