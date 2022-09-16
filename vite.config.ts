import { defineConfig } from 'vitest/config';
import { resolve } from 'path';
import typescript from '@rollup/plugin-typescript';

const resolvePath = (path: string) => resolve(__dirname, path);

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
	],
	resolve: {
		alias: {
			lib: resolvePath('./lib'),
		},
	},
	build: {
		lib: {
			entry: resolvePath('./lib/index.ts'),
			name: 'SvelteRouter',
			formats: ['es'],
		},
		rollupOptions: {
			// make sure to externalize deps that shouldn't be bundled
			// into your library
			external: [
				'@crikey/stores-base-queue',
				'@crikey/stores-strict',
				'regexparam',
				'svelte',
			],
			plugins: [
				typescript({
					target: 'ESNEXT',
					rootDir: resolvePath('./lib'),
					declaration: true,
					declarationDir: resolvePath('./dist'),
				}),
			],
		},
	},
	test: {
		globals: true,
		environment: 'jsdom',
		// includeSource: ['lib/**/*.{js,ts,svelte}'],
	},
});
