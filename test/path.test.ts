import { parse_path, PathKind, type PathSpec } from 'lib/path';

function clean(regex: RegExp) {
  return regex.toString().replace(/^\/|\/$/g, '');
}

const tests: Record<string, PathSpec> = {
  '': {
    kind: PathKind.STATIC,
    pattern: '',
    key: '',
  },
  '/': {
    kind: PathKind.STATIC,
    pattern: '',
    key: '',
  },
  blog: {
    kind: PathKind.STATIC,
    pattern: clean(/\/blog/),
    key: 'blog',
  },
  'blog.json': {
    kind: PathKind.STATIC,
    pattern: clean(/\/blog\.json/),
    key: 'blog.json',
  },
  '[slug]': {
    kind: PathKind.ONE,
    pattern: clean(/\/([^/]+)/),
    key: 'slug',
  },
  '(group)': {
    kind: PathKind.STATIC,
    pattern: '',
    key: '',
  },
  '[catchall*]': {
    kind: PathKind.STAR,
    pattern: clean(/(?:\/(.*))?/),
    key: 'catchall',
  },
  '[catchplus+]': {
    kind: PathKind.PLUS,
    pattern: clean(/\/(.+)/),
    key: 'catchplus',
  },
  '[catchoptional?]': {
    kind: PathKind.OPTIONAL,
    pattern: clean(/(?:\/([^/]+))?/),
    key: 'catchoptional',
  },
};

for (const [key, expected] of Object.entries(tests)) {
  it(`parse_route_id: "${key}"`, () => {
    const actual = parse_path(key);

    expect(actual).toEqual(expected);
  });
}
