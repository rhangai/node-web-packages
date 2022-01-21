module.exports = {
	extends: [
		'plugin:vue/essential',
		'@rhangai/typescript',
		'@vue/typescript/recommended',
		'@vue/prettier',
		'@vue/prettier/@typescript-eslint',
	],
	rules: {
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
						pattern: '{@test/**/*,@@test/**/*}',
						group: 'external',
						position: 'after',
					},
					{
						pattern: '{@@**,@@*/**,@app/**/*}',
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
