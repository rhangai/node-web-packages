import { FormRule, FormRuleResult } from './rules';

export function createFormValidator<T, TArgs extends unknown[]>(
	validator: (value: T, ...args: TArgs) => FormRuleResult
) {
	return (...args: TArgs): FormRule<T> =>
		(v: T) =>
			validator(v, ...args);
}
