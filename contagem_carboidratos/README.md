# Contagem de Carboidratos

Aplicação pessoal (SPA em React) para acompanhar o plano nutricional receitado por uma
nutricionista e comparar, dia a dia, o que foi realmente comido com a meta de calorias e
carboidratos. Roda como página estática, sem backend — os dados ficam salvos no navegador
(`localStorage`), com exportar/importar manual pela tela **Backup**.

Disponível em: `herbertsds.github.io/contagem_carboidratos/`

## Funcionalidades

- **Plano Nutricional**: cadastro das refeições receitadas, com alimentos e quantidades.
- **Refeições**: o que foi comido em cada dia, comparado com a meta do plano (calorias e
  carboidratos), com sugestão de substituição de alimentos sem estourar o orçamento.
- **Alimentos**: correção de itens do catálogo, cadastro de alimentos novos e variações de
  marca (ex: "Pão de forma integral" da Vigor vs. da Panco).
- **Backup**: exportar/importar todos os dados salvos.

As decisões de arquitetura e o funcionamento de cada parte estão documentados em
[`specs/`](specs/).

## Rodando localmente

Não precisa de Node/npm instalados — o build roda dentro de um container Docker efêmero:

```bash
docker compose -f ../docker/docker-compose.yml run --rm contagem_carboidratos_build
```

O resultado (estático) fica em `contagem_carboidratos/` (fora de `app/`, que é só o código
fonte). Para conferir localmente sem subir nada além disso:

```bash
python3 -m http.server 8765
```

## Fonte dos dados de alimentos

A tabela de alimentos (medida caseira, calorias e carboidratos) vem do **Manual de Contagem de
Carboidratos**, publicado pela **Sociedade Brasileira de Diabetes (SBD)**
(`manual-contagem-carboidratos-web-1.pdf`, incluído nesta pasta), extraída por
[`extract_alimentos.py`](extract_alimentos.py). Os créditos também aparecem no próprio app,
no botão "ⓘ" ao lado do título.

Esta aplicação é um projeto pessoal, sem qualquer vínculo com a SBD, e não substitui orientação
nutricional profissional — em caso de dúvida sobre um valor, o manual original é a referência.

## Licença

O **código** deste projeto é disponibilizado sob uma licença aberta para **uso pessoal e não
comercial**: qualquer pessoa pode usar, copiar, estudar e adaptar este código para seus
próprios projetos pessoais, com atribuição a este repositório. Uso comercial (venda,
distribuição como produto ou serviço pago, etc.) não é autorizado sem permissão prévia.

Os **dados de alimentos** (a tabela extraída do manual) pertencem à Sociedade Brasileira de
Diabetes — esta licença cobre apenas o código da aplicação, não os direitos sobre o conteúdo
do manual original.

Este projeto é fornecido "como está", sem garantias de qualquer tipo.
