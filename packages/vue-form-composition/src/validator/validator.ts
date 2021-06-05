export type FormValidatorOptionsBase = {
	/**
	 * Mensagem de erro para a regra
	 */
	message?: string;
};

export type CreateFormValidatorOptions<T extends FormValidatorOptionsBase> = {
	/**
	 * Mensagem padrão caso a regra não passe uma mensagem específica
	 */
	defaultMessage: string;
	/**
	 * Test function
	 */
	test: (value: string | null | number | undefined, options: T) => boolean;
};

export function createFormValidator<T extends FormValidatorOptionsBase = FormValidatorOptionsBase>(
	createFormValidatorOptions: CreateFormValidatorOptions<T>
) {
	return function validator(options?: T | string) {
		let normalizedOptions: T;
		if (!options) {
			normalizedOptions = {} as T;
		} else if (typeof options === 'string') {
			normalizedOptions = { message: options } as T;
		} else {
			normalizedOptions = options;
		}
		return function rule(value: string | null | number | undefined) {
			const isValid = createFormValidatorOptions.test(value, normalizedOptions);
			if (!isValid) {
				return normalizedOptions.message || createFormValidatorOptions.defaultMessage;
			}
			return true;
		};
	};
}
