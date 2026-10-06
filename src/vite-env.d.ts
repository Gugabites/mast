/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/react" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
}
interface ImportMeta {
  readonly env: ImportMetaEnv
}

/** Hash curto do commit publicado ('local' fora do deploy). Definido em vite.config.ts. */
declare const __APP_VERSION__: string
/** Momento do build, em ISO. Definido em vite.config.ts. */
declare const __BUILD_TIME__: string
