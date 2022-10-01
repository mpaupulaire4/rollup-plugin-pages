export interface MatcherOptions {
  route: string;
  middleware: string;
  extension: string;
  meta: Record<string, string>;
}

export function get_match_strings(options: MatcherOptions, root: string): string[] {
  const matches = [
    `${root}/**/+{${options.route},${options.middleware}}.${options.extension}`,
  ];
  const metas = Object.entries(options.meta).map(([meta, ext]) => `${meta}.${ext}`);
  const joined = metas.length > 1 ? `{${metas.join(',')}}` : `${metas.join('')}`;
  if (metas.length) {
    matches.push(`${root}/**/+{${options.route},${options.middleware}}.${joined}`);
  }
  return matches;
}
