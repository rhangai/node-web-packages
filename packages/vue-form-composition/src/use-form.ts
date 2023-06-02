import { computed, Ref, ref } from 'vue-demi';
import { FormStateContext, FormStatePropsType, provideFormState } from './state';
import { FormDefinition } from './types';
import { useFormValue, UseFormValueOptions, UseFormValueResult } from './use-form-value';

export type UseFormOptions<T extends Record<string, unknown>> = UseFormValueOptions<T> & {
	props: FormStatePropsType;
	form: FormDefinition<T>;
};

export type UseFormResult<T extends Record<string, unknown>> = FormStateContext &
	UseFormValueResult<T> & {
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
export function useForm<T extends Record<string, unknown>>(
	options: UseFormOptions<T>
): UseFormResult<T> {
	const { formStateReadonly, formStateDisabled, formStateShouldValidate, formUseSubmitting } =
		useFormStateSubmitting(options.props);

	const { form, formSet, formReset } = useFormValue(options.form, options);

	return {
		form,
		formStateReadonly,
		formStateDisabled,
		formStateShouldValidate,
		formSet,
		formReset,
		formUseSubmitting,
	};
}

function useFormStateSubmitting(props: FormStatePropsType) {
	const formSubmittingRefs = ref<Array<Ref<boolean>>>([]);
	const formState = provideFormState({
		shouldValidate: computed(() => props.shouldValidate),
		readonly: computed(() => props.readonly),
		disabled: computed(() => {
			for (const submittingRef of formSubmittingRefs.value) {
				if (submittingRef.value) return true;
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
	return {
		...formState,
		formUseSubmitting,
	};
}
