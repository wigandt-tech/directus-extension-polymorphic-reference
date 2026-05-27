import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		environment: 'node',
		include: ['src/**/*.test.ts'],
	},
	resolve: {
		alias: {
			// Avoid loading the real app-only SDK in a Node test run.
			'@directus/extensions-sdk': fileURLToPath(new URL('./test/stubs/extensions-sdk.ts', import.meta.url)),
		},
	},
});
