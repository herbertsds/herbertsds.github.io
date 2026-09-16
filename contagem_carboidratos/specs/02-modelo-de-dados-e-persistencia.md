# Modelo de dados e persistência

## O requisito por trás disso

Hoje tudo é salvo em `localStorage` porque é uma SPA estática sem backend. Mas o pedido
explícito foi: se um dia isso virar uma API, a troca tem que ser **simples e visível** — ou
seja, não pode haver `localStorage.getItem`/`setItem` espalhado pelos componentes. Toda leitura
e escrita de dados passa por um único lugar por entidade.

## As três camadas

```
src/data/
  storage/
    localStorageAdapter.js          <- único arquivo que toca window.localStorage
  repositories/
    alimentosRepository.js          <- catálogo: JSON estático + overrides + customizados, mesclados
    alimentosOverridesRepository.js <- correções em cima de itens do catálogo (chave alimentos_overrides)
    alimentosCustomizadosRepository.js <- alimentos criados pelo usuário (chave alimentos_customizados)
    alimentosVariacoesRepository.js <- variações de marca de qualquer alimento (chave alimentos_variacoes)
    planoNutricionalRepository.js
    refeicoesDoDiaRepository.js
```

Detalhes de `alimentosOverridesRepository`/`alimentosCustomizadosRepository` e como
`alimentosRepository` mescla tudo (e por que exclusão de customizado é soft-delete) estão em
[06](06-alimentos-e-backup.md).

- `localStorageAdapter`: `readJSON(chave, padrao)` / `writeJSON(chave, valor)` / `remove(chave)`.
  Todas as chaves levam o prefixo `contagem_carboidratos:`. Erros de parse/quota são pegos e
  logados, nunca propagam para quem chamou.
- Cada `repository` expõe funções **assíncronas** (`async get...()`, `async salvar(...)`)
  mesmo sendo síncronas por baixo hoje. É proposital: no dia de trocar por uma API, a
  implementação interna vira um `fetch(...)`, mas a assinatura (e todo mundo que já chama a
  função) não muda nada.
- **Nenhum componente ou hook chama `localStorage` ou `fetch` diretamente.** Hooks em
  `src/hooks/` (`usePlanoNutricional`, `useRefeicoesDoDia`, `useAlimentos`) são a única ponte
  entre os repositories e a UI — eles guardam o estado local (React state) e chamam o
  repository certo para persistir.

## Estruturas

```js
// alimentosRepository.getAll() — catálogo somente leitura, vem de app/public/alimentos.json
Alimento = {
  id: string,               // ex: "a0001" — estável, gerado pelo extract_alimentos.py
  alimento: string,
  medida: string,           // medida caseira, ex: "1 fatia"
  quantidade_g_ml: number,  // peso/volume da medida caseira; pode ser 0 (ver abaixo)
  carboidratos_g: number,   // CHO da medida caseira
  calorias_kcal: number,    // kcal da medida caseira
  quantidade_indefinida: boolean,
}

// planoNutricionalRepository — plano único e ativo (não há histórico de planos anteriores)
PlanoNutricional = {
  refeicoes: [
    {
      id: string,
      tipo: string,     // 'Café da Manhã' | ... | qualquer nome digitado pelo usuário
      horario: string,  // 'HH:MM'
      itens: [ { id: string, alimentoId: string, quantidadeG: number } ],
    },
  ],
}

// refeicoesDoDiaRepository — uma entrada por data ('YYYY-MM-DD'), cada dia começa vazio
DiaRegistro = {
  data: string,
  refeicoes: [
    {
      id: string,
      tipo: string,     // casa com PlanoNutricional.refeicoes[].tipo pelo NOME, não por id —
                         // assim o registro do dia não quebra se o plano for editado depois
      horario: string,
      itens: [
        {
          id: string,
          alimentoId: string,
          quantidadeG: number,
          origem: 'sugestao-plano' | 'extra' | 'substituicao',
        },
      ],
    },
  ],
}
```

## Cálculo: gramas -> calorias/carboidratos

Os valores do JSON são para a "medida usual" (ex: 1 fatia = 90g = 5g CHO = 86kcal). Para uma
quantidade em gramas qualquer, a conta é linear:

```
taxa = campo_do_alimento / quantidade_g_ml
valor_do_item = taxa * quantidadeG_do_item
```

Implementado em `src/domain/calculos.js` (`calcularItem`, `calcularTotalItens`,
`calcularTotalRefeicoes`).

**Exceção — `quantidade_indefinida`**: os 85 alimentos com `quantidade_g_ml = 0` não têm taxa
por grama (divisão por zero). Para eles, `quantidadeG` no item passa a significar **número de
porções** (múltiplo inteiro da medida usual), e o cálculo é `calorias_kcal * quantidadeG` em
vez de dividir por peso. A UI (`AlimentoQuantidadeModal`) troca o rótulo do campo para
"Quantas porções?" nesse caso.

## Meta e delta (Refeições do Dia)

Não existe vínculo por id entre uma refeição do dia e uma refeição do plano — o casamento é
por **nome do tipo** (`refeicao.tipo === planoRefeicao.tipo`). A meta de uma refeição do dia é
a soma de todas as refeições do plano com esse mesmo tipo (normalmente uma só). A meta do dia é
a soma de todo o plano. O delta é sempre `consumido - meta`.

Decisão consciente: casar por nome, não por id de referência, para que editar/excluir uma
refeição do plano nunca deixe um registro de dia "órfão" — o pior caso é a meta virar 0 se o
tipo for renomeado, não um erro.
