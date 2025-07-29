/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BACKEND_URL: string;
  // You can add other VITE_ environment variables here as you need them
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}