module.exports = {
	extends: [
		'plugin:vue/essential',
		'eslint-config-airbnb-base',
		'@vue/typescript/recommended',
		'@vue/prettier',
		'@vue/prettier/@typescript-eslint',
	],
	settings: {
		'import/extensions': ['.js', '.jsx', '.ts', '.tsx'],
		'import/resolver': {
			node: {
				extensions: ['.js', '.jsx', '.ts', '.tsx'],
			},
		},
	},
	rules: {
		'no-void': ['error', { allowAsStatement: true }],
		'no-use-before-define': ['error', 'nofunc'],
		'no-shadow': 'off',
		'prefer-destructuring': ['error', { object: true, array: false }],
		'@typescript-eslint/no-floating-promises': 'error',
		'@typescript-eslint/explicit-module-boundary-types': 'off',
		'@typescript-eslint/no-shadow': ['error'],
		'import/prefer-default-export': 'off',
		'import/extensions': [
			'error',
			{
				'.js': 'never',
				'.jsx': 'never',
				'.ts': 'never',
				'.tsx': 'never',
				'.json': 'always',
				'.vue': 'always',
			},
		],
		'import/no-unresolved': [
			'error',
			{
				ignore: ['^@@', '^~'],
			},
		],
		'import/order': [
			'error',
			{
				groups: [
					//
					'builtin',
					'external',
					'internal',
					'parent',
					'sibling',
					'index',
				],
				pathGroups: [
					{
						pattern: '{vue-demi,@vue/composition-api}',
						group: 'external',
						position: 'before',
					},
					{
						pattern: '@nuxtjs/composition-api',
						group: 'external',
						position: 'before',
					},
					{
						pattern: '{@@**,@@*/**}',
						group: 'internal',
						position: 'before',
					},
					{
						pattern: '{~/**,~/*/**}',
						group: 'internal',
					},
				],
				pathGroupsExcludedImportTypes: ['builtin'],
				alphabetize: {
					order: 'asc',
					caseInsensitive: true,
				},
			},
		],
	},
};
