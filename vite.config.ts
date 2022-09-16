import { defineConfig } from 'vitest/config';
import { resolve } from 'path';
import typescript from '@rollup/plugin-typescript';
import { FileRouter } from './lib';

const resolvePath = (path: string) => resolve(__dirname, path);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [FileRouter({})],
  resolve: {
    alias: {
      lib: resolvePath('./lib'),
    },
  },
  build: {
    lib: {
      entry: resolvePath('./lib/index.ts'),
      name: 'SvelteRouter',
      formats: ['es'],
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: [
        'fs/promises',
        'fs',
        'path',
        'regexparam',
        'svelte',
      ],
      plugins: [
        typescript({
          target: 'ESNEXT',
          rootDir: resolvePath('./lib'),
          declaration: true,
          declarationDir: resolvePath('./dist'),
        }),
      ],
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    // includeSource: ['lib/**/*.{js,ts,svelte}'],
  },
});
