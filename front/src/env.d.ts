interface ImportMetaEnv {
    readonly VITE_ADDRESS: string;
    readonly VITE_PORT: string;
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }