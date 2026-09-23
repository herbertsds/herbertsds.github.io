import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// A saída do build vai direto para contagem_carboidratos/ (fora de app/), commitada
// e servida como página estática do GitHub Pages em herbertsds.github.io/contagem_carboidratos/.
// base relativo porque o subpath de hospedagem não é conhecido em build time.
// emptyOutDir=false porque essa pasta também guarda o PDF fonte, o script de extração e os specs —
// a limpeza dos artefatos antigos de build é feita antes do `vite build` (ver docker-compose.yml).
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: '../',
    emptyOutDir: false,
  },
  // Só importa fora do dev server (build/preview não usam isso). Por padrão o Vite recusa
  // (403) requisições cujo cabeçalho Host não seja localhost/IP direto — proteção contra DNS
  // rebinding para quem expõe o dev server direto na internet. Aqui ele nunca é exposto direto
  // (só alcançável dentro da rede Docker `infra_net`, atrás do Nginx Proxy Manager — ver
  // ../docker-compose.yml), então desligar essa checagem é seguro; sem isso, nem o nome do
  // container nem o domínio público que o NPM usa passariam.
  server: {
    allowedHosts: true,
  },
})
