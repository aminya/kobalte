import { defineConfig } from 'vitest/config';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
	plugins: [
		solidPlugin(),
	],
	test: {
		environment: 'jsdom',
		globals: true,
		setupFiles: ['../../node_modules/@testing-library/jest-dom/vitest'],
		isolate: false,
	},
	resolve: {
		conditions: ['development', 'browser'],
	},
});