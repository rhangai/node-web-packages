import { computed, Ref, reactive, ref } from '@vue/composition-api';
import { FormState, FormStatePropsType, provideFormState } from './state';
import { FormDefinition, FormType } from './types';

export type UseFormOptions<T> = {
	props: FormStatePropsType;
	form: FormDefinition<T>;
	onValue?: (value: T) => void;
};

export type UseFormResult<T> = {
	/**
	 * The form object, only allows
	 */
	form: FormType<T>;
	/**
	 * Set a value on the form
	 */
	formSet: (inputValue: Partial<T> | null) => void;
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
export function useForm<T>(options: UseFormOptions<T>): UseFormResult<T> {
	const { formState, formUseSubmitting } = useFormStateSubmitting(options.props);
	const form: FormType<T> = reactive(clone(options.form)) as FormType<T>;
	if ('seal' in Object) Object.seal(form);
	const formSet = (inputValue: Partial<T> | null) => {
		if (inputValue === form) return;

		const newValue = clone(options.form);
		if (!inputValue || typeof inputValue !== 'object') {
			Object.assign(form, newValue);
			options.onValue?.(form as T);
			return;
		}

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
