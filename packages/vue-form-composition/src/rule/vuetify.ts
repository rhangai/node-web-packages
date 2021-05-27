export type VuetifyRuleOptionsBase = {
	/**
	 * Mensagem de erro para a regra
	 */
	message?: string;
};

export type CreateVuetifyRuleFactoryOptions<T extends VuetifyRuleOptionsBase> = {
	/**
	 * Mensagem padrão caso a regra não passe uma mensagem específica
	 */
	defaultMessage?: string;
	/**
	 * Test function
	 */
	test: (value: string | null | number | undefined, options: T) => boolean;
};

export function createVuetifyRuleFactory<T extends VuetifyRuleOptionsBase = VuetifyRuleOptionsBase>(
	createVuetifyRuleOptions: CreateVuetifyRuleFactoryOptions<T>
) {
	return function ruleFactory(options?: T | string) {
		let normalizedOptions: T;
		if (!options) {
			normalizedOptions = {} as T;
		} else if (typeof options === 'string') {
			normalizedOptions = { message: options } as T;
		} else {
			normalizedOptions = options;
		}
		return function rule(value: string | null | number | undefined) {
			const isValid = createVuetifyRuleOptions.test(value, normalizedOptions);
			if (!isValid) {
				return normalizedOptions.message || createVuetifyRuleOptions.defaultMessage || 'Campo inválido';
			}
			return true;
		};
	};
}
