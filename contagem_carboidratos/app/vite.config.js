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
})
