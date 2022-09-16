import type { Plugin } from 'vite';
import { resolve, basename } from 'path';
import template from './templates';
import { parseFS, getMatcer, type MatcherOptions } from './parseFS';
// const templates = require('./templates');

export type Config = Partial<MatcherOptions> & {
  rootDir?: string;
  virtual?: string;
};

const DefaultOptions: MatcherOptions = {
  route: 'page',
  middleware: 'layout',
  extensions: ['ts'],
  meta: {
    data: ['ts'],
  },
};

export function FileRouter({
  rootDir = './src/pages',
  virtual = `virtual:fs-routes`,
  ...options
}: Config = {}): Plugin {
  rootDir = resolve(rootDir);
  const resolvedVirtual = `\0${virtual}`;
  const matcher = getMatcer({
    ...DefaultOptions,
    ...options,
  });
  return {
    name: 'rollup-plugin-pages',
    buildStart() {
      this.addWatchFile(rootDir);
    },
    configureServer: ({ watcher, ws, moduleGraph }) => {
      const update = (path: string) => {
        if (!path.startsWith(rootDir) && !matcher(basename(path))) return;
        const mod = moduleGraph.getModuleById(resolvedVirtual);
        if (!mod) return;
        moduleGraph.invalidateModule(mod);
        ws.send({ type: 'full-reload' });
      };
      watcher.on('add', update);
      watcher.on('unlink', update);
    },
    resolveId(id) {
      return id === virtual ? resolvedVirtual : null;
    },
    async load(id) {
      if (id !== resolvedVirtual) return null;
      const routes = await parseFS(rootDir, matcher);
      const code = template(routes);
      return code;
    },
  };
}
