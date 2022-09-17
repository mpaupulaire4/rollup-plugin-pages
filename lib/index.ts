import type { Plugin } from 'vite';
import { resolve, basename } from 'path';
export * from './configs/index';
import { parseFS, getMatcer, type MatcherOptions, type Route } from './parseFS';
// const templates = require('./templates');

export type Config = Partial<MatcherOptions> & {
  rootDir?: string;
  virtual?: string;
  render?: (routes: Route[]) => string;
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
  render = data => `export default ${JSON.stringify(data)};`,
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
      return render(await parseFS(rootDir, matcher));
    },
  };
}
