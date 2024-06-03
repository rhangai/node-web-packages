import configs, {
	type ConfigOptions,
	type EslintConfig,
	type EslintConfigRules,
} from '@rhangai/eslint-config-typescript';
// @ts-expect-error Types are not defined
import pluginVue from 'eslint-plugin-vue';
// @ts-expect-error Types are not defined
import pluginVueScopedCss from 'eslint-plugin-vue-scoped-css';

export type VueConfigOptions = ConfigOptions & {
	multiWordComponentNameIgnores?: string[];
};

const RULES = {
	vue: {
		'vue/no-mutating-props': [
			'error',
			{
				shallowOnly: true,
			},
		],
	},
	vueOnlyFiles: {
		'@typescript-eslint/prefer-function-type': 'off',
		'no-useless-assignment': 'off',
	},
	scoped: {
		'vue-scoped-css/enforce-style-type': ['error', { allows: ['scoped'] }],
		'vue-scoped-css/require-v-deep-argument': 'error',
		'vue-scoped-css/require-v-global-argument': 'error',
		'vue-scoped-css/require-v-slotted-argument': 'error',
		'vue-scoped-css/no-deprecated-v-enter-v-leave-class': 'error',
		'vue-scoped-css/v-deep-pseudo-style': ['error', ':deep'],
		'vue-scoped-css/v-global-pseudo-style': ['error', ':global'],
		'vue-scoped-css/v-slotted-pseudo-style': ['error', ':slotted'],
	},
	prettier: {
		'vue/html-quotes': 'off',
		'vue/max-attributes-per-line': 'off',
		'vue/html-end-tags': 'off',
		'vue/html-indent': 'off',
		'vue/html-closing-bracket-newline': 'off',
		'vue/html-closing-bracket-spacing': 'off',
		'vue/multiline-html-element-content-newline': 'off',
		'vue/singleline-html-element-content-newline': 'off',
	},
} satisfies Record<string, EslintConfigRules>;

function createConfig(options: VueConfigOptions): EslintConfig[] {
	// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
	const recommendedVue = pluginVue.configs['flat/recommended'] as EslintConfig[];
	return [
		...configs.ts({
			...options,
			parserOptions: {
				parser: '@typescript-eslint/parser',
				extraFileExtensions: ['.vue'],
				...options.parserOptions,
			},
		}),
		...recommendedVue,
		{
			name: '@rhangai/esling-config-vue-typescript/vue',
			plugins: {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				'vue-scoped-css': pluginVueScopedCss,
			},
			rules: {
				...RULES.vue,
				...RULES.scoped,
				...RULES.prettier,
				'vue/multi-word-component-names': [
					'warn',
					{ ignores: options.multiWordComponentNameIgnores },
				],
			},
		},
		{
			name: '@rhangai/esling-config-vue-typescript/vue-only',
			files: ['**/*.vue'],
			rules: {
				...RULES.vueOnlyFiles,
			},
		},
		{
			name: '@rhangai/esling-config-vue-typescript/vue-pages',
			files: ['**/pages/**/*.vue', '**/*.*.vue'],
			rules: {
				'vue/multi-word-component-names': 'off',
			},
		},
	];
}

type Config = {
	vue: (options: VueConfigOptions) => EslintConfig[];
	vuePug: (options: VueConfigOptions) => EslintConfig[];
};

const config: Config = {
	vue(options) {
		return createConfig(options);
	},
	vuePug(options) {
		return createConfig({
			...options,
			parserOptions: {
				templateTokenizer: { pug: 'vue-eslint-parser-template-tokenizer-pug' },
				...options.parserOptions,
			},
		});
	},
};
export default config;
