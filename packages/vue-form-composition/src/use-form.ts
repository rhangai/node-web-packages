import { computed, Ref, reactive, ref } from '@vue/composition-api';
import { FormState, FormStatePropsType, provideFormState } from './state';
import { FormDefinition, FormType } from './types';

export type UseFormOptions<T extends Record<string, unknown>> = {
	props: FormStatePropsType;
	form: FormDefinition<T>;
	onValue?: (value: T) => void;
};

export type UseFormResult<T extends Record<string, unknown>> = {
	/**
	 * The form object, only allows
	 */
	form: Ref<FormType<T>>;
	/**
	 * Set a value on the form
	 */
	formSet: <TInput = Partial<T>>(inputValue: TInput) => void;
	/**
	 * Reset the form
	 */
	formReset: () => void;
	/**
	 * State of the current form.
	 */
	formState: FormState;
	/**
	 * Use to disable the form when submitting.
	 * Calling this function multiple types will disable the form if ANY of the refs are true.
	 */
	formUseSubmitting: (submitting: Ref<boolean>) => () => void;
};

/**
 * Create a form to use
 * @param options
 * @returns
 */
export function useForm<T extends Record<string, unknown>>(options: UseFormOptions<T>): UseFormResult<T> {
	const { formState, formUseSubmitting } = useFormStateSubmitting(options.props);
	const formValue: FormType<T> = reactive(clone(options.form)) as FormType<T>;
	if ('seal' in Object) Object.seal(formValue);

	const formSet = (inputValueParam: unknown | null) => {
		if (inputValueParam === formValue) return;

		const newValue = clone(options.form);
		if (!inputValueParam || typeof inputValueParam !== 'object') {
			Object.assign(formValue, newValue);
			options.onValue?.(formValue as T);
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
		options.onValue?.(formValue as T);
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
		formState,
		formSet,
		formReset: () => formSet(null),
		formUseSubmitting,
	};
}

function useFormStateSubmitting(props: FormStatePropsType) {
	const formSubmittingRefs = ref<Array<Ref<boolean>>>([]);
	const { formState } = provideFormState({
		...props,
		disabled: computed(() => {
			for (const submittingRef of formSubmittingRefs.value) {
				if (submittingRef.value) return false;
			}
			return props.disabled;
		}),
	});
	const formUseSubmitting = (submittingRef: Ref<boolean>) => {
		formSubmittingRefs.value.push(submittingRef);
		return () => {
			const index = formSubmittingRefs.value.indexOf(submittingRef);
			if (index >= 0) formSubmittingRefs.value.splice(index, 1);
		};
	};
	return { formState, formUseSubmitting };
}

function clone<T>(obj: T): T {
	return JSON.parse(JSON.stringify(obj));
}
