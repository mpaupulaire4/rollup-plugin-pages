import { parse, RouteSym, MainSym, add, remove, type ParsedFS } from 'lib/parse';

const files = [
  '+page.ts',
  '+layout.ts',
  'page/+page.ts',
  'page/+layout.ts',
  'page/+layout.data.ts',
  '(group)/group1/+page.ts',
  '(group)/group2/+page.ts',
  '(group)/+layout.ts',
];

describe('parse', () => {
  let parsed: ParsedFS;
  beforeEach(() => {
    parsed = {
      [RouteSym]: {
        page: {
          [MainSym]: '+page.ts',
        },
        layout: {
          [MainSym]: '+layout.ts',
        },
      },
      page: {
        [RouteSym]: {
          page: {
            [MainSym]: 'page/+page.ts',
          },
          layout: {
            [MainSym]: 'page/+layout.ts',
            data: 'page/+layout.data.ts',
          },
        },
      },
      '(group)': {
        [RouteSym]: {
          layout: {
            [MainSym]: '(group)/+layout.ts',
          },
        },
        group1: {
          [RouteSym]: {
            page: {
              [MainSym]: '(group)/group1/+page.ts',
            },
          },
        },
        group2: {
          [RouteSym]: {
            page: {
              [MainSym]: '(group)/group2/+page.ts',
            },
          },
        },
      },
    };
  });

  it(`parses files to treelike structure`, () => {
    const out = parse(files, '');
    expect(out).toEqual({
      [RouteSym]: {
        page: {
          [MainSym]: '+page.ts',
        },
        layout: {
          [MainSym]: '+layout.ts',
        },
      },
      page: {
        [RouteSym]: {
          page: {
            [MainSym]: 'page/+page.ts',
          },
          layout: {
            [MainSym]: 'page/+layout.ts',
            data: 'page/+layout.data.ts',
          },
        },
      },
      '(group)': {
        [RouteSym]: {
          layout: {
            [MainSym]: '(group)/+layout.ts',
          },
        },
        group1: {
          [RouteSym]: {
            page: {
              [MainSym]: '(group)/group1/+page.ts',
            },
          },
        },
        group2: {
          [RouteSym]: {
            page: {
              [MainSym]: '(group)/group2/+page.ts',
            },
          },
        },
      },
    });
  });

  it(`parses files to treelike structure ignoring root`, () => {
    const rooted = files.map(f => `/some/root/${f}`);
    const out = parse(rooted, '/some/root/');
    expect(out).toEqual({
      [RouteSym]: {
        page: {
          [MainSym]: '/some/root/+page.ts',
        },
        layout: {
          [MainSym]: '/some/root/+layout.ts',
        },
      },
      page: {
        [RouteSym]: {
          page: {
            [MainSym]: '/some/root/page/+page.ts',
          },
          layout: {
            [MainSym]: '/some/root/page/+layout.ts',
            data: '/some/root/page/+layout.data.ts',
          },
        },
      },
      '(group)': {
        [RouteSym]: {
          layout: {
            [MainSym]: '/some/root/(group)/+layout.ts',
          },
        },
        group1: {
          [RouteSym]: {
            page: {
              [MainSym]: '/some/root/(group)/group1/+page.ts',
            },
          },
        },
        group2: {
          [RouteSym]: {
            page: {
              [MainSym]: '/some/root/(group)/group2/+page.ts',
            },
          },
        },
      },
    });
  });

  it(`can add a file`, () => {
    add(parsed, 'new/route/+page.ts', '');
    expect(parsed).toEqual({
      new: {
        route: {
          [RouteSym]: {
            page: {
              [MainSym]: 'new/route/+page.ts',
            },
          },
        },
      },
      [RouteSym]: {
        page: {
          [MainSym]: '+page.ts',
        },
        layout: {
          [MainSym]: '+layout.ts',
        },
      },
      page: {
        [RouteSym]: {
          page: {
            [MainSym]: 'page/+page.ts',
          },
          layout: {
            [MainSym]: 'page/+layout.ts',
            data: 'page/+layout.data.ts',
          },
        },
      },
      '(group)': {
        [RouteSym]: {
          layout: {
            [MainSym]: '(group)/+layout.ts',
          },
        },
        group1: {
          [RouteSym]: {
            page: {
              [MainSym]: '(group)/group1/+page.ts',
            },
          },
        },
        group2: {
          [RouteSym]: {
            page: {
              [MainSym]: '(group)/group2/+page.ts',
            },
          },
        },
      },
    });
  });

  it(`can remove a meta file`, () => {
    remove(parsed, 'page/+layout.data.ts', '');
    expect(parsed).toEqual({
      [RouteSym]: {
        page: {
          [MainSym]: '+page.ts',
        },
        layout: {
          [MainSym]: '+layout.ts',
        },
      },
      page: {
        [RouteSym]: {
          page: {
            [MainSym]: 'page/+page.ts',
          },
          layout: {
            [MainSym]: 'page/+layout.ts',
          },
        },
      },
      '(group)': {
        [RouteSym]: {
          layout: {
            [MainSym]: '(group)/+layout.ts',
          },
        },
        group1: {
          [RouteSym]: {
            page: {
              [MainSym]: '(group)/group1/+page.ts',
            },
          },
        },
        group2: {
          [RouteSym]: {
            page: {
              [MainSym]: '(group)/group2/+page.ts',
            },
          },
        },
      },
    });
  });

  it(`can remove a main file`, () => {
    remove(parsed, 'page/+page.ts', '');
    expect(parsed).toEqual({
      [RouteSym]: {
        page: {
          [MainSym]: '+page.ts',
        },
        layout: {
          [MainSym]: '+layout.ts',
        },
      },
      page: {
        [RouteSym]: {
          page: {},
          layout: {
            [MainSym]: 'page/+layout.ts',
            data: 'page/+layout.data.ts',
          },
        },
      },
      '(group)': {
        [RouteSym]: {
          layout: {
            [MainSym]: '(group)/+layout.ts',
          },
        },
        group1: {
          [RouteSym]: {
            page: {
              [MainSym]: '(group)/group1/+page.ts',
            },
          },
        },
        group2: {
          [RouteSym]: {
            page: {
              [MainSym]: '(group)/group2/+page.ts',
            },
          },
        },
      },
    });
  });
});
