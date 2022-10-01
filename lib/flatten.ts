import { type PathSpec, parse_path } from './path.js';
import { type ParsedFS, RouteSym, MainSym } from './parse.js';

export interface Route {
  path: PathSpec;
  meta: Record<string, string>;
  main: string;
  routes?: Route[];
}

export function wrapped_as_route(
  structure: ParsedFS,
  route: string,
  middleware: string,
  path: PathSpec = parse_path('/')
): Route {
  const routes = Object.keys(structure).map(key =>
    wrapped_as_route(structure[key], route, middleware, parse_path(key))
  );
  if (structure[RouteSym]) {
    const rInfo = structure[RouteSym][route];
    if (rInfo && rInfo[MainSym]) {
      const { [MainSym]: main, ...meta } = rInfo;
      routes.unshift({
        path: parse_path('/'),
        main,
        meta,
      });
    }
    const mInfo = structure[RouteSym][middleware];
    if (mInfo && mInfo[MainSym]) {
      const { [MainSym]: main, ...meta } = mInfo;
      return {
        path,
        main,
        meta,
        routes,
      };
    }
  }
  return {
    path,
    meta: {},
    main: '',
    routes,
  };
}

export function as_routes(
  structure: ParsedFS,
  route: string,
  middleware: string
): Route[] {
  const data = wrapped_as_route(structure, route, middleware);
  if (!data.main) {
    return data.routes || [];
  }
  return [data];
}

export interface Handler {
  path: PathSpec[];
  handlers: {
    main: string;
    meta: Record<string, string>;
  }[];
}

export function as_handlers(
  structure: ParsedFS,
  route: string,
  middleware: string,
  path: PathSpec[] = [parse_path('/')]
): Handler[] {
  const handlers = Object.keys(structure).flatMap(key =>
    as_handlers(structure[key], route, middleware, path.concat(parse_path(key)))
  );
  let info = structure?.[RouteSym]?.[route];
  if (info && info[MainSym]) {
    const { [MainSym]: main, ...meta } = info;
    handlers.push({
      path,
      handlers: [{ main, meta }],
    });
  }

  info = structure?.[RouteSym]?.[middleware];
  if (info && info[MainSym]) {
    const { [MainSym]: main, ...meta } = info;
    const handler = {
      meta,
      main,
    };
    handlers.forEach(h => {
      h.handlers.unshift(handler);
    });
  }

  return handlers;
}
