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

## PWA — "Adicionar à tela de início" abre em tela cheia

`app/index.html` referencia um `manifest.json` (em `app/public/`, copiado pro `outDir` do
mesmo jeito que `alimentos.json`) com `"display": "standalone"` — instalado (Android: menu do
Chrome → "Instalar app"/"Adicionar à tela inicial"; iOS: Safari → Compartilhar → "Adicionar à
Tela de Início"), abre sem barra de endereço nem abas, como um app nativo. iOS **ignora o
manifest** pra isso — precisa das tags à parte em `index.html`
(`apple-mobile-web-app-capable`, `apple-touch-icon`, etc.), por isso as duas coisas coexistem.
Nome exibido embaixo do ícone: `manifest.json` (`name`/`short_name`, Android) e
`apple-mobile-web-app-title` (iOS) — os três valores usam o nome completo "Contagem de
Carboidratos", não uma versão abreviada.

Os ícones (`icon-192.png`, `icon-512.png`, `apple-touch-icon.png`, em `app/public/`) são o
mesmo emoji 🥗 usado no favicon da aba (`app/index.html`), renderizado uma vez com Pillow: a
fonte `Apple Color Emoji.ttc` só rasteriza em tamanhos fixos (máximo 160px), então o emoji é
desenhado a 160px e escalado (`Image.resize`, `LANCZOS`) pra cada tamanho final, centralizado
num fundo branco sólido com margem generosa (~19% de cada lado) pra sobreviver às máscaras
circulares/arredondadas que Android e iOS aplicam por cima do ícone quadrado — não há script de
geração no repo, foram só copiados prontos.

### Notch/relógio sobrepondo o topo (`black-translucent`)

`apple-mobile-web-app-status-bar-style: black-translucent` (em `index.html`) faz a barra de
status do iOS ficar **translúcida por cima** do conteúdo, em vez de reservar espaço próprio —
é o que dá aquele visual "tela cheia de verdade" do app instalado, mas como efeito colateral
qualquer elemento encostado no topo (o `.app-header`, ou um modal alto que não cabe
centralizado e "sobe" até lá) nasce fisicamente por baixo do relógio/notch, ilegível e
inclicável (bug real: o botão de fechar de um modal ficava embaixo do relógio). Corrigido em
`index.css` com `padding-top: env(safe-area-inset-top)` — no `.app-header` (via
`max(0.75rem, env(...))`, pra não perder o padding normal em telas sem notch) e no `.modal` do
react-bootstrap (`padding-top: env(safe-area-inset-top) !important`, porque a lib não sabe
nada sobre safe area). Só funciona porque o `viewport-fit=cover` já estava na tag de viewport
— sem ele, `env(safe-area-inset-*)` sempre resolve pra `0px`.

**Sem service worker de propósito**: não é necessário pro "Adicionar à tela de início" abrir
em `standalone` nem em nenhuma das duas plataformas, e cache offline traria complexidade
(invalidação a cada deploy) sem necessidade real aqui — o app já funciona só com rede. Sem
service worker, quem invalida o cache HTTP em standalone no iOS (que às vezes não revalida
sozinho) é a pessoa: botão "Buscar atualizações" na aba Backup, ver
[06](06-alimentos-e-backup.md).

## Verificação local sem GitHub Pages

```bash
cd contagem_carboidratos
python3 -m http.server 8765
```

E abrir `http://localhost:8765/`.

## Deploy contínuo num servidor próprio (dev server, sem build)

Além do GitHub Pages (build estático, commitado), existe um segundo jeito de rodar este
projeto: `contagem_carboidratos/docker-compose.yml` (diferente de `../docker/docker-compose.yml`,
que é só ferramental local de build/preview) sobe o próprio **Vite dev server** e deixa no ar
(`restart: unless-stopped`), sem gerar nenhum artefato de build — pensado pra um servidor que já
tenha o repositório clonado e atualizado via `git pull` (feito à parte, fora deste compose), por
trás de um proxy reverso (ex: Nginx Proxy Manager).

```bash
docker compose -f contagem_carboidratos/docker-compose.yml up -d
```

Três detalhes:
- `npm run dev -- --host 0.0.0.0`: por padrão o Vite dev server só escuta em `localhost`, o que
  fica inacessível de fora do container. `--host 0.0.0.0` é obrigatório aqui.
- `node_modules` em **volume nomeado** próprio, não vindo do bind mount de `./app`: o container
  roda Linux (`node:20-alpine`) mas o host que clona o repo pode ser outra plataforma — um
  `node_modules` instalado fora (com binários nativos de outra arquitetura, ex: `rollup`/`esbuild`)
  sendo montado dentro quebraria o container. Cada lado cuida do próprio `node_modules`.
- **Sem `base: './'` no dev server**: diferente do build estático (que usa paths relativos pra
  funcionar em qualquer subpath do GitHub Pages), o Vite dev server sempre serve os módulos em
  paths absolutos (`/src/main.jsx`, `/@vite/client`) — o proxy reverso precisa apontar um
  **subdomínio inteiro** pra essa porta (5173), não um subpath tipo `/contagem_carboidratos/`.
