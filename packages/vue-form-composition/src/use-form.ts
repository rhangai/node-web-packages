import { computed, Ref, ComputedRef, reactive, UnwrapRef, isRef } from '@vue/composition-api';
import { FormControl, FormControlPropsType, provideFormControl } from './control';

type Exact<T, SHAPE> = T extends SHAPE ? (Exclude<keyof T, keyof SHAPE> extends never ? T : void) : void;

export type FormRules<T> = Partial<Record<keyof T, unknown>>;

export type UseFormOptions<T> = {
	props: FormControlPropsType;
	form: () => T;
	formRules?: ReactiveValue<FormRules<T>>;
	onValue?: (value: T) => void;
};

export type UseFormResult<T> = {
	form: Ref<T>;
	formGet: <U = T>() => Exact<T, U>;
	formSet: (inputValue: Partial<T> | null) => void;
	formReset: () => void;
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
			options.onValue?.(formRaw);
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
		options.onValue?.(formRaw);
	};

	const form = computed<T>({
		get: () => formRaw,
		set: (value: any) => formSet(value),
	});

	const formRules = computed<FormRules<T>>(() => {
		if (!formControl.shouldValidate) return {};
		if (formControl.readonly || formControl.disabled) return {};
		const formRulesValue = resolveValue(options.formRules);
		return formRulesValue ?? {};
	});

	return {
		form,
		formGet<U = T>() {
			return formRaw as Exact<T, U>;
		},
		formSet,
		formReset: () => formSet(null),
		formRules,
		formControl,
		formControlUseSubmitting,
	};
}

type ReactiveValue<T> = T | (() => T) | ComputedRef<T>;
function resolveValue<T>(param: T | (() => T) | ComputedRef<T>): T {
	if (isRef(param)) return param.value;
	else if (typeof param === 'function') return (param as any)();
	return param;
}
