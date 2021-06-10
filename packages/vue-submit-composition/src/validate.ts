import { isRef, Ref } from '@vue/composition-api';

export type ValidateItem =
	| boolean
	| (() => ValidateItem | Promise<ValidateItem>)
	| Ref<ValidateItem>
	| Array<ValidateItem>
	| { validate(): ValidateItem | Promise<ValidateItem> };

export async function validateItem(rule: ValidateItem): Promise<boolean> {
	if (rule == null) return true;
	if (Array.isArray(rule)) {
		let isValid = true;
		for (const child of rule) {
			const childIsValid = await validateItem(child);
			if (!childIsValid) isValid = false;
		}
		return isValid;
	} else if (isRef(rule)) {
		return validateItem(rule.value);
	} else if (typeof rule === 'function') {
		return validateItem(await rule());
	} else if (typeof rule === 'object') {
		if ('validate' in rule!) {
			return validateItem((rule as any).validate());
		}
		return true;
	}
	return rule !== false;
}
