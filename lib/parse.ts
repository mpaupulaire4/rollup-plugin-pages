import set from 'set-value';

export const RouteSym = Symbol('route');
export const MainSym = Symbol('main');

export interface ParsedFS {
  [RouteSym]?: Record<string, Record<string | typeof MainSym, string>>;
  [dir: string]: ParsedFS;
}

export function parse(files: string[]) {
  const obj: ParsedFS = {};
  for (const file of files) {
    add(obj, file);
  }
  return obj;
}

function file_to_key(file: string) {
  const dirs = file.split('/');
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

export function add(fs: ParsedFS, file: string) {
  const keys = file_to_key(file);
  if (keys) {
    set(fs, keys, file);
  }
}

export function remove(fs: ParsedFS, file: string) {
  const keys = file_to_key(file);
  if (keys) {
    set(fs, keys, undefined);
  }
}
