import { computed, Ref, reactive, ref, watch } from '@vue/composition-api';
import { FormControl, FormControlPropsType, provideFormControl } from './control';
import { FormDefinition, FormType } from './types';

export type UseFormOptions<T> = {
	props: FormControlPropsType;
	form: FormDefinition<T>;
	onValue?: (value: unknown) => void;
};

export type UseFormResult<T> = {
	form: FormType<T>;
	formSet: (inputValue: Partial<T> | null) => void;
	formReset: () => void;
	formControl: FormControl;
	formUseSubmitting: (submitting: Ref<boolean>) => void;
};

/**
 * Create a form to use
 * @param options
 * @returns
 */
export function useForm<T>(options: UseFormOptions<T>): UseFormResult<T> {
	const formSubmitting = ref(false);
	const { formControl } = provideFormControl({
		...options.props,
		disabled: computed(() => (formSubmitting.value ? true : options.props.disabled)),
	});
	const form: FormType<T> = reactive(clone(options.form)) as FormType<T>;
	if ('seal' in Object) Object.seal(form);
	const formSet = (inputValue: Partial<T> | null) => {
		const newValue = clone(options.form);
		if (!inputValue || typeof inputValue !== 'object') {
			Object.assign(form, newValue);
			options.onValue?.(form as T);
			return;
		}

		if (inputValue === form) return;
		for (const key in inputValue) {
			if (inputValue[key] === undefined) continue;
			if (key in form) {
				(newValue as any)[key] = inputValue[key];
			}
		}
		Object.assign(form, newValue);
		options.onValue?.(form as T);
	};

	return {
		form,
		formControl,
		formSet,
		formReset: () => formSet(null),
		formUseSubmitting(submitting) {
			watch(
				submitting,
				(v) => {
					formSubmitting.value = v;
				},
				{ immediate: true }
			);
		},
	};
}

function clone<T>(obj: T): T {
	return JSON.parse(JSON.stringify(obj));
}
