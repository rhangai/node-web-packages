module.exports = {
	parser: 'vue-eslint-parser',
	parserOptions: {
		parser: '@typescript-eslint/parser',
	},
	extends: [
		'plugin:vue/essential',
		'@rhangai/typescript',
		'@vue/eslint-config-typescript/recommended',
		'@vue/eslint-config-prettier',
	],
	rules: {
		'vue/valid-v-slot': [
			'error',
			{
				allowModifiers: true,
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
