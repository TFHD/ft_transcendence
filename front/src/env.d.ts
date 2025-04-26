interface ImportMetaEnv {
    readonly VITE_ADRESS: string;
    readonly VITE_PORT: string;
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }