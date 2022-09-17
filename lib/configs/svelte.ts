import M from 'mustache';
import { Route } from '../parseFS.js';
import { Config } from '../index.js';

const template = `{{> imports}}

export default [
{{#routes}}
  {{>obj}}
{{/routes}}
]
`;
const partials = {
  imports: `{{#imports}}
import {{&name}} from "{{&component}}";
{{#data}}
import {{&name}}FN from "{{&data}}";
{{/data}}
{{/imports}}
`,
  obj: `{
  path: '{{&path}}',
  handlers: [
    {{#handlers}}
    [{{name}}, {{#data}}{{&name}}FN{{/data}}{{^data}}null{{/data}}]
    {{/handlers}}
  ]
},
`,
};

const SvelteRouterRender = (routes: Route[]) => {
  const imports = Array.from(
    new Map(
      routes.flatMap(r => {
        return r.handlers.map(h => [h.name, h]);
      })
    ).values()
  );
  return M.render(template, { routes, imports }, partials);
};

export const SvelteRouterOptions: Config = {
  render: SvelteRouterRender,
  extensions: ['svelte'],
  middleware: 'layout',
  route: 'page',
  meta: {
    data: ['ts', 'js'],
  },
};
