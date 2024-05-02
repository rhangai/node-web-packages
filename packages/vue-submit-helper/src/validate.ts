import { isRef, type Ref } from 'vue';

type ValidateLikeObject = { validate(): VueSubmitValidateItem | Promise<VueSubmitValidateItem> };

const VALIDATE_SYMBOL = Symbol('@rhangai/vue-submit-helper:validate');

export type VueSubmitValidateItem =
	| boolean
	| (() => VueSubmitValidateItem | Promise<VueSubmitValidateItem>)
	| Ref<VueSubmitValidateItem>
	| VueSubmitValidateItem[]
	| VueSubmitValidateResult
	| ValidateLikeObject;

export type VueSubmitValidateResult = {
	[VALIDATE_SYMBOL]: true;
	valid: boolean;
	error?: Error | undefined;
};

export async function submitValidate(
	rule: VueSubmitValidateItem | null | undefined
): Promise<VueSubmitValidateResult> {
	if (rule == null) {
		return {
			[VALIDATE_SYMBOL]: true,
			valid: true,
		};
	}
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
		return {
			[VALIDATE_SYMBOL]: true,
			valid: isValid,
			error: createError(errors),
		};
	} else if (isRef(rule)) {
		return submitValidate(rule.value);
	} else if (typeof rule === 'function') {
		return submitValidate(await rule());
	} else if (typeof rule === 'object') {
		if (VALIDATE_SYMBOL in rule) {
			return rule;
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
		valid: rule,
	};
}

/**
 * Create the error
 *
 * If the error array is of length 0, returns undefined
 * If the error array is of length 1, return the element
 * If the error array has more than 1 item, return a new AggregateError
 */
function createError(errors: Error[]): Error | undefined {
	if (errors.length <= 0) {
		return undefined;
	}
	if (errors.length === 1) {
		return errors[0];
	}
	return new AggregateError(errors);
}
