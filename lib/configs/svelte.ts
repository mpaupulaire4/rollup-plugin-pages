import M from 'mustache';
import { type ParsedFS } from '../parse.js';
import { type Config } from '../index.js';
import { to_regex } from '../path.js';

const template = `{{> imports}}

export default [
{{#routes}}
  {{>obj}}
{{/routes}}
];
`;
const partials = {
  imports: `{{#imports}}
import C{{&id}} from "{{&main}}";
{{#meta.data}}
import C{{&id}}FN from "{{&meta.data}}";
{{/meta.data}}
{{/imports}}
`,
  obj: `{
  pattern: {{&pattern}},
  keys: {{&keys}},
  handlers: [
    {{#handlers}}
    [C{{&id}}, {{#meta.data}}C{{&id}}FN{{/meta.data}}{{^meta.data}}null{{/meta.data}}],
    {{/handlers}}
  ]
},
`,
};

interface Item {
  id: number;
  main: string;
  meta: Record<string, string>;
}

interface Handler {
  pattern: string;
  keys: string;
  handlers: Item[];
}

const render: Config['render'] = (data: ParsedFS, { as_handlers }) => {
  const handlers: Handler[] = as_handlers(data).map(h => {
    const [pattern, keys] = to_regex(h.path);
    return {
      handlers: h.handlers.map(h => ({ meta: h.meta, main: h.main, id: 0 })),
      pattern,
      keys: `[${keys.map(k => JSON.stringify(k)).join(',')}]`,
    };
  });

  const unique_parts = Array.from(
    new Map(
      handlers.flatMap(r => {
        return r.handlers.map(h => [h.main, h]);
      })
    ).values()
  );
  unique_parts.forEach((u, i) => (u.id = i));

  return M.render(template, { routes: handlers, imports: unique_parts }, partials);
};

export const SvelteRouterOptions: Config = {
  render: render,
  extension: 'svelte',
  middleware: 'layout',
  route: 'page',
  meta: {
    data: 'js',
  },
};
