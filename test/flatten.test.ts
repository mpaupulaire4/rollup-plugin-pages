import { RouteSym, MainSym } from 'lib/parse';
import { as_routes, as_handlers } from 'lib/flatten';

// path is ignored here as it is direct output of another tested function

describe('as_route', () => {
  it(`properly parses single routes`, () => {
    const out = as_routes(
      {
        [RouteSym]: {
          page: {
            [MainSym]: '+page.ts',
          },
        },
      },
      'page',
      'layout'
    );
    expect(out).toEqual([
      {
        main: '+page.ts',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        path: expect.any(Object),
        meta: {},
      },
    ]);
  });

  it(`properly parses single routes with meta`, () => {
    const out = as_routes(
      {
        [RouteSym]: {
          page: {
            [MainSym]: '+page.ts',
            data: '+page.data.ts',
          },
        },
      },
      'page',
      'layout'
    );
    expect(out).toEqual([
      {
        main: '+page.ts',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        path: expect.any(Object),
        meta: {
          data: '+page.data.ts',
        },
      },
    ]);
  });

  it(`properly parses routes with layout`, () => {
    const out = as_routes(
      {
        [RouteSym]: {
          layout: {
            [MainSym]: '+root.ts',
          },
        },
        nested: {
          [RouteSym]: {
            layout: {
              [MainSym]: '+nested.ts',
            },
            page: {
              [MainSym]: '+page.ts',
            },
          },
        },
      },
      'page',
      'layout'
    );
    expect(out).toEqual([
      {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        path: expect.any(Object),
        meta: {},
        main: '+root.ts',
        routes: [
          {
            main: '+nested.ts',
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            path: expect.any(Object),
            meta: {},
            routes: [
              {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                path: expect.any(Object),
                main: '+page.ts',
                meta: {},
              },
            ],
          },
        ],
      },
    ]);
  });
});

function path_parts(num: number) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return new Array(num).fill(expect.any(Object));
}
describe('as_handler', () => {
  it(`properly parses single routes`, () => {
    const out = as_handlers(
      {
        [RouteSym]: {
          page: {
            [MainSym]: '+page.ts',
          },
        },
      },
      'page',
      'layout'
    );
    expect(out).toEqual([
      {
        path: path_parts(1),
        handlers: [
          {
            main: '+page.ts',
            meta: {},
          },
        ],
      },
    ]);
  });

  it(`properly parses single routes with meta`, () => {
    const out = as_handlers(
      {
        [RouteSym]: {
          page: {
            [MainSym]: '+page.ts',
            data: '+page.data.ts',
          },
        },
      },
      'page',
      'layout'
    );
    expect(out).toEqual([
      {
        path: path_parts(1),
        handlers: [
          {
            main: '+page.ts',
            meta: {
              data: '+page.data.ts',
            },
          },
        ],
      },
    ]);
  });

  it(`properly parses routes with layout`, () => {
    const out = as_handlers(
      {
        [RouteSym]: {
          layout: {
            [MainSym]: '+root.ts',
          },
        },
        nested: {
          [RouteSym]: {
            layout: {
              [MainSym]: '+nested.ts',
            },
            page: {
              [MainSym]: '+page.ts',
            },
          },
        },
      },
      'page',
      'layout'
    );
    expect(out).toEqual([
      {
        path: path_parts(2),
        handlers: [
          {
            main: '+root.ts',
            meta: {},
          },
          {
            main: '+nested.ts',
            meta: {},
          },
          {
            main: '+page.ts',
            meta: {},
          },
        ],
      },
    ]);
  });
});
