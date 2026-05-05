import { defineConfig } from 'astro/config';
import { createReadStream } from 'fs';
import { stat } from 'fs/promises';
import path from 'path';
import { extname } from 'path';

const MIME = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.png': 'image/png', '.gif': 'image/gif',
  '.svg': 'image/svg+xml', '.webp': 'image/webp',
  '.ico': 'image/x-icon', '.pdf': 'application/pdf',
};

export default defineConfig({
  site: 'https://sinole.lv',
  vite: {
    plugins: [{
      name: 'serve-root-assets',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (!req.url?.startsWith('/assets/')) return next();
          const file = path.join(process.cwd(), decodeURIComponent(req.url.split('?')[0]));
          try {
            await stat(file);
            res.setHeader('Content-Type', MIME[extname(file).toLowerCase()] ?? 'application/octet-stream');
            createReadStream(file).pipe(res);
          } catch {
            next();
          }
        });
      }
    }]
  },
  integrations: [{
    name: 'copy-assets-to-dist',
    hooks: {
      'astro:build:done': async () => {
        const { cp } = await import('fs/promises');
        const { existsSync } = await import('fs');
        if (existsSync('./assets')) {
          await cp('./assets', './dist/assets', { recursive: true, force: true });
        }
      }
    }
  }]
});
