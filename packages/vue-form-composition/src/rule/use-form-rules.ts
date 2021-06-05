import { computed, ComputedRef, isRef } from '@vue/composition-api';
import { useFormControl } from '../state';
import { FormType } from '../types';

export type FormRules<T> = Partial<Record<keyof T, unknown>>;

export type UseFormRulesResult<T> = {
	formRules: ComputedRef<FormRules<T>>;
};

export function useFormRules<T>(form: FormType<T>, formRulesParam: ReactiveValue<FormRules<T>>): UseFormRulesResult<T> {
	const { formControl } = useFormControl();
	const formRules = computed<FormRules<T>>(() => {
		if (!formControl.shouldValidate) return {};
		if (formControl.readonly || formControl.disabled) return {};
		const formRulesValue = resolveValue(formRulesParam);
		return formRulesValue ?? {};
	});
	return {
		formRules,
	};
}

type ReactiveValue<T> = T | (() => T) | ComputedRef<T>;
function resolveValue<T>(param: T | (() => T) | ComputedRef<T>): T {
	if (isRef(param)) return param.value;
	else if (typeof param === 'function') return (param as any)();
	return param;
}
