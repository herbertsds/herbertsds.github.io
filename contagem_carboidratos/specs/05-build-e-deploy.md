# Build e deploy

## Por que Docker

A máquina onde isso foi desenvolvido não tem Node/npm instalados — só Docker. O build inteiro
(instalar dependências + `vite build`) acontece dentro de um container `node:20-alpine`
descartável: sobe, builda, morre (`docker compose run --rm`, sem `restart`, diferente do
serviço `pagina_inicial` que já existia no `docker-compose.yml` e fica sempre no ar).

```bash
docker compose -f docker/docker-compose.yml run --rm contagem_carboidratos_build
```

## Onde o build sai

`contagem_carboidratos/app/vite.config.js` define:

```js
base: './',              // paths relativos — não depende de saber o subpath em build time
build: { outDir: '../', emptyOutDir: false }
```

`outDir: '../'` manda o resultado (`index.html`, `assets/*.js`, `assets/*.css`) direto para
`contagem_carboidratos/` (fora de `app/`), no mesmo nível do PDF fonte, do script de extração e
desta pasta `specs/`. Esse é o padrão que o resto do repositório `herbertsds.github.io` já usa
— GitHub Pages "cru" (sem Jekyll, sem Actions), cada subpasta serve seu próprio `index.html`
(ver `/study/`). Não existe pipeline de CI aqui: o build roda localmente e o resultado é
commitado no repositório.

**Duas pegadinhas resolvidas:**

- O `.gitignore` da raiz tem uma regra solta `dist` (sem `/` na frente), que ignoraria uma
  pasta chamada `dist` em **qualquer profundidade** do repositório. Por isso o outDir não pode
  se chamar `dist` — daí sair direto em `contagem_carboidratos/`.
- `emptyOutDir: false` porque essa pasta de saída também guarda arquivos que não são do build
  (PDF, script Python, specs). O `docker-compose.yml` limpa só o que o build gera antes de
  rodar (`rm -rf assets/ index.html`), não a pasta inteira.
- O serviço do `docker-compose.yml` monta `contagem_carboidratos/` inteira como volume (não só
  `app/`) — montar só `app/` faria o `outDir: '../'` cair fora do volume, e o resultado do
  build se perderia junto com o container ao terminar (bug real, pego e corrigido durante o
  desenvolvimento: a primeira versão só montava `app/` e o build "funcionava" mas não gravava
  nada no host).

## Dado de referência (`alimentos.json`)

Fonte de verdade em `app/public/alimentos.json` (gerado por `../extract_alimentos.py`). O
Vite copia arquivos de `public/` para a raiz do `outDir` durante o build — como o outDir é
`contagem_carboidratos/`, o resultado é `contagem_carboidratos/alimentos.json`, carregado em
runtime via `fetch` (não bundled no JS) por `alimentosRepository`.

## Verificação local sem GitHub Pages

```bash
cd contagem_carboidratos
python3 -m http.server 8765
```

E abrir `http://localhost:8765/`.
