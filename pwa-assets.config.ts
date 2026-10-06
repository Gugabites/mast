import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'

// Gera os PNG do app a partir de public/icon-source.svg: `npx pwa-assets-generator`.
// Os arquivos gerados são commitados; a geração não roda no deploy.
export default defineConfig({
  headLinkOptions: { preset: '2023' },
  preset: {
    ...minimal2023Preset,
    maskable: { ...minimal2023Preset.maskable, padding: 0, resizeOptions: { background: '#1E6B47' } },
    apple: { ...minimal2023Preset.apple, padding: 0, resizeOptions: { background: '#1E6B47' } },
  },
  images: ['public/icon-source.svg'],
})
