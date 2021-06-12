import { isRef, Ref } from '@vue/composition-api';

type ValidateLikeObject = { validate(): ValidateItem | Promise<ValidateItem> };

export type ValidateItem =
	| boolean
	| (() => ValidateItem | Promise<ValidateItem>)
	| Ref<ValidateItem>
	| Array<ValidateItem>
	| ValidateLikeObject;

export async function validateItem(rule: ValidateItem): Promise<boolean> {
	if (rule == null) return true;
	if (Array.isArray(rule)) {
		let isValid = true;
		await Promise.all(
			rule.map(async (child) => {
				const childIsValid = await validateItem(child);
				if (!childIsValid) isValid = false;
			})
		);
		return isValid;
	} else if (isRef(rule)) {
		return validateItem(rule.value);
	} else if (typeof rule === 'function') {
		return validateItem(await rule());
	} else if (typeof rule === 'object') {
		if ('validate' in rule) {
			return validateItem(await rule.validate());
		}
		return true;
	}
	return rule !== false;
}
