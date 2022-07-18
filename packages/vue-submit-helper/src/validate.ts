import { isRef, Ref } from 'vue-demi';

type ValidateLikeObject = { validate(): VueSubmitValidateItem | Promise<VueSubmitValidateItem> };

const VALIDATE_SYMBOL = Symbol('@rhangai/vue-submit-helper:validate');

export type VueSubmitValidateItem =
	| boolean
	| (() => VueSubmitValidateItem | Promise<VueSubmitValidateItem>)
	| Ref<VueSubmitValidateItem>
	| Array<VueSubmitValidateItem>
	| VueSubmitValidateResult
	| ValidateLikeObject;

export type VueSubmitValidateResult = {
	[VALIDATE_SYMBOL]: true;
	valid: boolean;
	error?: Error | undefined;
};

export async function submitValidate(
	rule: VueSubmitValidateItem
): Promise<VueSubmitValidateResult> {
	if (rule == null)
		return {
			[VALIDATE_SYMBOL]: true,
			valid: true,
		};
	if (Array.isArray(rule)) {
		let isValid = true;
		const errors: Error[] = [];
		await Promise.all(
			rule.map(async (child) => {
				const childResult = await submitValidate(child);
				if (!childResult.valid) {
					isValid = false;
					if (childResult.error) {
						errors.push(childResult.error);
					}
				}
			})
		);
		const error =
			// eslint-disable-next-line no-nested-ternary
			errors.length <= 0
				? undefined
				: errors.length <= 1
				? errors[0]
				: new AggregateError(errors);
		return {
			[VALIDATE_SYMBOL]: true,
			valid: isValid,
			error,
		};
	} else if (isRef(rule)) {
		return submitValidate(rule.value);
	} else if (typeof rule === 'function') {
		return submitValidate(await rule());
	} else if (typeof rule === 'object') {
		if (VALIDATE_SYMBOL in rule) {
			return rule as VueSubmitValidateResult;
		}
		if ('validate' in rule) {
			return submitValidate(await rule.validate());
		}
		return {
			[VALIDATE_SYMBOL]: true,
			valid: true,
		};
	}
	return {
		[VALIDATE_SYMBOL]: true,
		valid: rule !== false,
	};
}
