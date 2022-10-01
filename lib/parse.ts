import set from 'set-value';

export const RouteSym = Symbol('route');
export const MainSym = Symbol('main');

export interface ParsedFS {
  [RouteSym]?: Record<string, Record<string | typeof MainSym, string>>;
  [dir: string]: ParsedFS;
}

export function parse(files: string[], root: string) {
  const obj: ParsedFS = {};
  for (const file of files) {
    add(obj, file, root);
  }
  return obj;
}

function file_to_key(file: string, root = '') {
  file = file.replace(root, '');
  const dirs = file.split('/');
  if (!dirs[0]) {
    dirs.shift();
  }
  const filename = dirs.pop();
  const match = filename?.match(/^\+(.+?)(?:\.(\w+))?\.\w+$/);
  if (!match) return; // shouldn't be possible
  const [, type, meta] = match;
  let keys = (dirs as Array<string | symbol>).concat(RouteSym, type);
  if (meta) {
    keys = keys.concat(meta);
  } else {
    keys = keys.concat(MainSym);
  }
  return keys;
}

export function add(fs: ParsedFS, file: string, root: string) {
  const keys = file_to_key(file, root);
  if (keys) {
    set(fs, keys, file);
    return true;
  }
  return false;
}

export function remove(fs: ParsedFS, file: string, root: string) {
  const keys = file_to_key(file, root);
  if (keys) {
    set(fs, keys, undefined);
    return true;
  }
  return false;
}
