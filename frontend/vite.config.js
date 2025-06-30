import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import fs from 'fs';

function copyRewriteFiles() {
  return {
    name: 'copy-rewrite-files',
    closeBundle() {
      const dist = resolve(__dirname, 'dist');
      const redirects = resolve(__dirname, 'public/_redirects');
      const staticJson = resolve(__dirname, 'public/static.json');

      if (fs.existsSync(redirects)) {
        fs.copyFileSync(redirects, `${dist}/_redirects`);
      }

      if (fs.existsSync(staticJson)) {
        fs.copyFileSync(staticJson, `${dist}/static.json`);
      }
    }
  };
}

export default defineConfig({
  plugins: [react(), copyRewriteFiles()],
  server: { port: 3000 }
});
