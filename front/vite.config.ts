import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';

export default defineConfig(({ command }) => {
  return {
    assetsInclude: ['**/*.glb'],
    plugins: [react()],
    server: {
      host: true,
      port: 3000,
      ...(command === 'serve'
        ? {
            https: {
              key: fs.readFileSync('/certs/key.pem'),
              cert: fs.readFileSync('/certs/cert.pem')
            }
          }
        : {})
    }
  };
});