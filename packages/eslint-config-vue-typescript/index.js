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
					'internal',
					'external',
					'parent',
					'sibling',
					'index',
				],
				pathGroups: [
					{
						pattern: '{vue,vue-demi,@vue/composition-api}',
						group: 'builtin',
						position: 'after',
					},
					{
						pattern: '@nuxtjs/composition-api',
						group: 'builtin',
						position: 'after',
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
