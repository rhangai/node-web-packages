import { computed, reactive, Ref } from 'vue-demi';
import { FormDefinition, FormType } from './types';

export type UseFormValueOptions<T extends Record<string, unknown>> = {
	onValue?: (value: T) => void;
};

export type UseFormValueResult<T extends Record<string, unknown>> = {
	/**
	 * The form object, only allows
	 */
	form: Ref<FormType<T>>;
	/**
	 * Set a value on the form
	 */
	formSet(inputValue: Partial<FormDefinition<T>> | null): void;
	/**
	 * Reset the form
	 */
	formReset: () => void;
};

/**
 * Create a form value to use
 */
export function useFormValue<T extends Record<string, unknown>>(
	formDefinition: FormDefinition<T>,
	options?: UseFormValueOptions<T>
): UseFormValueResult<T> {
	const formValue = reactive(clone(formDefinition)) as FormType<T>;
	if ('seal' in Object) Object.seal(formValue);

	const formSet = (inputValueParam: unknown | null) => {
		if (inputValueParam === formValue) return;

		const newValue = clone(formDefinition);
		if (!inputValueParam || typeof inputValueParam !== 'object') {
			Object.assign(formValue, newValue);
			options?.onValue?.(formValue as T);
			return;
		}

		const inputValue = inputValueParam as Record<string, unknown>;
		for (const key in inputValue) {
			if (inputValue[key] === undefined) continue;
			if (key in formValue) {
				let itemValue = inputValue[key];
				if (Array.isArray(itemValue)) {
					itemValue = itemValue.slice(0);
				}
				(newValue as Record<string, unknown>)[key] = itemValue;
			}
		}
		Object.assign(formValue, newValue);
		options?.onValue?.(formValue as T);
	};

	const form = computed<FormType<T>>({
		get() {
			return formValue;
		},
		set(value: unknown | null) {
			formSet(value);
		},
	});

	return {
		form,
		formSet,
		formReset: () => formSet(null),
	};
}

function clone<T>(obj: T): T {
	return JSON.parse(JSON.stringify(obj));
}
