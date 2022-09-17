import { readdir } from 'fs/promises';
import { join } from 'path';
import type { Dirent } from 'fs';

interface Handler {
  component: string;
  name: string;
  [key: string]: string;
}

export enum FileType {
  ROUTE,
  MIDDLEWARE,
}

export interface Route {
  path: string;
  handlers: Handler[];
}

export interface MatcherOptions {
  route: string;
  middleware: string;
  extensions: string[];
  meta: Record<string, string[]>;
}

type Match = {
  type: FileType;
  meta?: string;
};

type Matcher = (path: string) => Match;

export function getMatcer(config: MatcherOptions): Matcher {
  return function matcher(path: string) {
    const match = path.match(/^\+(\w+)(\.(\w+))?\.(\w+)$/);
    if (!match) return;
    let type: FileType;
    if (config.route === match[1]) {
      type = FileType.ROUTE;
    } else if (config.middleware === match[1]) {
      type = FileType.MIDDLEWARE;
    } else {
      return;
    }
    if (!match[3] && config.extensions.includes(match[4])) {
      return { type };
    } else if (
      match[3] &&
      config.meta[match[3]] &&
      config.meta[match[3]].includes(match[4])
    ) {
      return { type, meta: match[3] };
    }
  };
}

export async function parseFS(
  folder: string,
  matcher: Matcher,
  path = '/',
  name = 'Root'
): Promise<Route[]> {
  const route: Handler = {
    component: '',
    name: name + 'Page',
  };
  const layout: Handler = {
    component: '',
    name: name + 'Layout',
  };
  const files: Dirent[] = await readdir(folder, { withFileTypes: true }).catch(() => []);
  let routes: Route[] = [];

  for (const file of files) {
    const file_path = join(folder, file.name);
    const match = matcher(file.name);
    if (file.isDirectory()) {
      routes = routes.concat(
        await parseFS(
          file_path,
          matcher,
          join(path, file.name.replace(/^\[(.+)\]$/, ':$1')),
          `${name}$${file.name.replace(/^\[(.+)\]$/, '$1')}`
        )
      );
    } else if (file.isFile() && match) {
      const e = match.type === FileType.ROUTE ? route : layout;
      if (match.meta) {
        e[match.meta] = file_path;
      } else {
        e.component = file_path;
      }
    }
  }

  if (route.component) {
    routes.push({
      path,
      handlers: [route],
    });
  }

  if (layout.component) {
    routes.forEach(r => {
      r.handlers.unshift(layout);
    });
  }

  return routes;
}
