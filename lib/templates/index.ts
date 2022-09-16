import M from 'mustache';
import { readFileSync } from 'fs';
import { join } from 'path';

const svelte = readFileSync(join(__dirname, './svelte.mustache')).toString();
const imports = readFileSync(join(__dirname, './imports.mustache')).toString();
const obj = readFileSync(join(__dirname, './obj.mustache')).toString();
// export default (data: any) => `export default ${JSON.stringify(data, null, 2)}`;
export default (routes: any) =>
  M.render(
    svelte,
    { routes },
    {
      imports,
      obj,
    }
  );
