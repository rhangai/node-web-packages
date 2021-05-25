module.exports = {
	root: true,
	plugins: ['@rhangai'],
	extends: ['plugin:@rhangai/vue-typescript'],
	parserOptions: {
		tsconfigRootDir: __dirname,
		project: './tsconfig.json',
	},
};
