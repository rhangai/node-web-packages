import { computed, watch, Ref, ComputedRef, reactive, UnwrapRef } from '@vue/composition-api';
import { FormControl, FormControlPropsType, provideFormControl } from './control';

type Exact<T, SHAPE> = T extends SHAPE ? (Exclude<keyof T, keyof SHAPE> extends never ? T : void) : void;

export type FormRules<T> = Partial<Record<keyof T, unknown>>;

export type UseFormOptions<T> = {
	props: FormControlPropsType & { value?: unknown };
	emit: (event: 'input', value: T) => void;
	form: () => T;
	formRules?: FormRules<T>;
};

export type UseFormResult<T> = {
	form: Ref<T>;
	formGet: <U = T>() => Exact<T, U>;
	formSet: (inputValue: Partial<T> | null) => void;
	formRules: ComputedRef<FormRules<T>>;
	formControl: UnwrapRef<FormControl>;
	formControlUseSubmitting: (submitting: Ref<boolean>) => void;
};

export function useForm<T extends {}>(options: UseFormOptions<T>): UseFormResult<T> {
	const { formControl, formControlUseSubmitting } = provideFormControl(options.props);
	const formRaw: T = reactive(options.form()) as T;

	const formSet = (inputValue: Partial<T> | null) => {
		const newValue = options.form();
		if (!inputValue || typeof inputValue !== 'object') {
			Object.assign(formRaw, newValue);
			options.emit('input', formRaw);
			return;
		}

		if (inputValue === formRaw) return;
		for (const key in inputValue) {
			if (inputValue[key] === undefined) continue;
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
		formGet<U = T>() {
			return formRaw as Exact<T, U>;
		},
		formSet,
		formRules,
		formControl,
		formControlUseSubmitting,
	};
}
