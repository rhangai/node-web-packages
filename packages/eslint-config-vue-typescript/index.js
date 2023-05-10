module.exports = {
	extends: [
		'plugin:vue/essential',
		'@rhangai/typescript',
		'@vue/eslint-config-typescript/recommended',
		'@vue/eslint-config-prettier',
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
