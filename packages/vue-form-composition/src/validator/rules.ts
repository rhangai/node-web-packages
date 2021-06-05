import { computed, ComputedRef, isRef } from '@vue/composition-api';
import { useFormState } from '../state';
import { FormType } from '../types';

export type FormRuleResult = boolean | string;

export type FormRule<T> = (item: T) => FormRuleResult;

export type FormRules<T> = {
	[K in keyof T]?: Array<FormRule<T[K]>> | undefined;
};

export type UseFormRulesResult<T> = {
	formRules: ComputedRef<FormRules<T>>;
};

export function useFormRules<T>(form: FormType<T>, formRulesParam: ReactiveValue<FormRules<T>>): UseFormRulesResult<T> {
	const { formState } = useFormState();
	const formRules = computed<FormRules<T>>(() => {
		if (!formState.shouldValidate) return {};
		if (formState.readonly || formState.disabled) return {};
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
