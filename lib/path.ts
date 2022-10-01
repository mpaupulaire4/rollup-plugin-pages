export enum PathKind {
  STATIC = 'static',
  STAR = 'star',
  PLUS = 'plus',
  ONE = 'one',
  OPTIONAL = 'optional',
}

export interface PathSpec {
  kind: PathKind;
  key: string;
  pattern: string;
}

function getKind(char?: string): PathKind {
  switch (char) {
    case '*':
      return PathKind.STAR;
    case '+':
      return PathKind.PLUS;
    case '?':
      return PathKind.OPTIONAL;
    default:
      return PathKind.ONE;
  }
}

function getPattern(kind: PathKind, key: string): string {
  switch (kind) {
    case PathKind.ONE:
      return '\\/([^/]+)';
    case PathKind.STAR:
      return '(?:\\/(.*))?';
    case PathKind.PLUS:
      return '\\/(.+)';
    case PathKind.OPTIONAL:
      return '(?:\\/([^/]+))?';
    default:
      return `\\/${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`;
  }
}

export function to_regex(parts: PathSpec[]): [string, string[]] {
  const keys: string[] = [];
  const pattern = parts.reduce((agg, p) => {
    if (p.kind !== PathKind.STATIC) {
      keys.push(p.key);
    }
    return `${agg}${p.pattern}`;
  }, '/^');
  return [`${pattern}\\/?$/`, keys];
}

export function parse_path(id: string, last = false): PathSpec {
  const append = last ? '\\/?' : '';
  // groups don't effect the path.
  if (!id || id === '/' || /^\([^)]+\)$/.test(id)) {
    return {
      pattern: append,
      key: '',
      kind: PathKind.STATIC,
    };
  }

  // dynamic path patterns
  const match = /^\[(\w+?)([*?+])?\]$/.exec(id);
  if (match) {
    const kind = getKind(match[2]);
    return {
      kind: kind,
      key: match[1],
      pattern: getPattern(kind, match[1]) + append,
    };
  }

  // otherwise treat it as static
  return {
    pattern: getPattern(PathKind.STATIC, id) + append,
    key: id,
    kind: PathKind.STATIC,
  };
}
