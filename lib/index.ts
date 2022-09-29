import type { Plugin } from 'vite';
import { join } from 'path';
import glob from 'fast-glob';
import micromatch from 'micromatch';
export * from './configs/index.js';
import { type MatcherOptions, get_match_strings } from './glob.js';
import { parse, ParsedFS, add, remove } from './parse.js';
import { as_routes, as_handlers, Handler, Route } from './flatten.js';

type Utils = {
  as_handlers: (data: ParsedFS) => Handler[];
  as_routes: (data: ParsedFS) => Route[];
};

export type Config = Partial<MatcherOptions> & {
  rootDir?: string;
  virtual?: string;
  render?: (routes: ParsedFS, utils: Utils) => string;
  handlers?: boolean;
};

const DefaultOptions: MatcherOptions = {
  route: 'page',
  middleware: 'layout',
  extension: 'ts',
  meta: {
    data: 'ts',
  },
};

const virtual = `virtual:fs-routes`;
const resolvedVirtual = `\0${virtual}`;

export function FileRouter({
  rootDir = './src/pages',
  render = data => `export default ${JSON.stringify(data)};`,
  ...rest
}: Config = {}): Plugin {
  const options = {
    ...DefaultOptions,
    ...rest,
  };
  let parsed: ParsedFS = {};
  const utils: Utils = {
    as_handlers: (data: ParsedFS) => as_handlers(data, options.route, options.middleware),
    as_routes: (data: ParsedFS) => as_routes(data, options.route, options.middleware),
  };
  return {
    name: 'rollup-plugin-pages',
    async buildStart() {
      this.addWatchFile(rootDir);
      const matchers = get_match_strings(options);
      const files = await glob(matchers, { onlyFiles: true, cwd: rootDir, unique: true });
      parsed = parse(files);
    },
    configResolved(config) {
      rootDir = join(config.root, rootDir);
    },
    configureServer: ({ watcher, ws, moduleGraph }) => {
      const matchers = get_match_strings(options);
      const matches = (file: string) => micromatch.isMatch(file, matchers);
      const update = (path: string) => {
        if (!path.startsWith(rootDir) || !matches(path)) return '';
        const mod = moduleGraph.getModuleById(resolvedVirtual);
        if (!mod) return '';
        moduleGraph.invalidateModule(mod);
        path = path.replace(`${rootDir}/`, '');
        return path;
      };
      watcher.on('add', f => {
        add(parsed, update(f)) && ws.send({ type: 'full-reload' });
      });
      watcher.on('unlink', f => {
        remove(parsed, update(f)) && ws.send({ type: 'full-reload' });
      });
    },
    resolveId(id) {
      return id === virtual ? resolvedVirtual : null;
    },
    load(id) {
      if (id !== resolvedVirtual) return null;
      // return 'export defaul {};'
      return render(parsed, utils);
    },
  };
}
