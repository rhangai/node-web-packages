import config from '@rhangai/eslint-config-vue-typescript';

export default [
	{
		ignores: ['**/dist/'],
	},
	...config.vue({
		meta: import.meta,
		devFiles: ['**/tsup.config.ts'],
	}),
];
