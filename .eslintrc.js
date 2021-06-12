module.exports = {
	root: true,
	extends: ['@rhangai/vue-typescript'],
	ignorePatterns: ['.eslintrc.js'],
	parserOptions: {
		tsconfigRootDir: __dirname,
		project: './tsconfig.json',
	},
};
