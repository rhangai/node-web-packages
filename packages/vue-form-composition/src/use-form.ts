import { computed, watch, Ref, ComputedRef, reactive, UnwrapRef } from '@vue/composition-api';
import { FormControl, FormControlPropsType, provideFormControl } from './control';

export type FormRules<T> = Partial<Record<keyof T, unknown>>;

export type UseFormOptions<T> = {
	props: FormControlPropsType & { value?: unknown };
	emit: (event: 'input', value: T) => void;
	form: () => T;
	formRules?: FormRules<T>;
};

export type UseFormResult<T> = {
	form: Ref<T>;
	formRules: ComputedRef<FormRules<T>>;
	formControl: UnwrapRef<FormControl>;
	formControlUseSubmitting: (submitting: Ref<boolean>) => void;
};

export function useForm<T extends {}>(options: UseFormOptions<T>): UseFormResult<T> {
	const { formControl, formControlUseSubmitting } = provideFormControl(options.props);
	const formRaw: T = reactive(options.form()) as T;

	const formSet = (inputValue: any) => {
		const newValue = options.form();
		if (!inputValue || typeof inputValue !== 'object') {
			Object.assign(formRaw, newValue);
			options.emit('input', formRaw);
			return;
		}

		if (inputValue === formRaw) return;
		for (const key in inputValue) {
			if (key in formRaw) {
				(newValue as any)[key] = inputValue[key];
			}
		}
		Object.assign(formRaw, newValue);
		options.emit('input', formRaw);
	};

	const form = computed<T>({
		get: () => formRaw,
		set: (value: any) => formSet(value),
	});
	watch(() => options.props.value, formSet, { immediate: true });

	const formRules = computed<FormRules<T>>(() => {
		if (!formControl.shouldValidate) return {};
		if (formControl.readonly || formControl.disabled) return {};
		return options.formRules ?? {};
	});

	return {
		form,
		formRules,
		formControl,
		formControlUseSubmitting,
	};
}
