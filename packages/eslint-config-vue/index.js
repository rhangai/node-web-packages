module.exports = {
	extends: [
		'plugin:vue/essential',
		'@vue/airbnb',
		'@vue/typescript/recommended',
		'@vue/prettier',
		'@vue/prettier/@typescript-eslint',
	],
	rules: {
		'@typescript-eslint/no-floating-promises': 'error',
		'no-void': ['error', { allowAsStatement: true }],
	},
};
