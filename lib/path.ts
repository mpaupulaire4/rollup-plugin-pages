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

function getKind(char?: string) {
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

function getPattern(kind: PathKind, key: string) {
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

export function parse_path(id: string): PathSpec {
  // groups don't effect the path.
  if (!id || id === '/' || /^\([^)]+\)$/.test(id)) {
    return {
      pattern: '',
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
      pattern: getPattern(kind, match[1]),
    };
  }

  // otherwise treat it as static
  return {
    pattern: getPattern(PathKind.STATIC, id),
    key: id,
    kind: PathKind.STATIC,
  };
}
