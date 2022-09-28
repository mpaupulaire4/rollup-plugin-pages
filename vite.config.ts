import { defineConfig } from 'vitest/config';
import { resolve } from 'path';
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
  test: {
    globals: true,
  },
});
