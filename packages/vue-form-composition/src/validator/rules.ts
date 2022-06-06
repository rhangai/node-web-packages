import { computed, isRef, Ref, unref } from '@vue/composition-api';
import { useFormState } from '../state';
import { FormType } from '../types';

export type FormRuleResult = boolean | string;

export type FormRule<T> = (item: T) => FormRuleResult;

export type FormRules<T> = {
	[K in keyof T]?: Array<FormRule<T[K]>> | undefined;
};

export type UseFormRulesResult<T> = {
	formRules: Readonly<Ref<FormRules<T>>>;
};

export function useFormRules<T extends Record<string, unknown>>(
	_form: Ref<FormType<T>>,
	formRulesParam: ReactiveValue<FormRules<T>>
): UseFormRulesResult<T> {
	const { formStateShouldValidate } = useFormState();
	const formRules = computed<FormRules<T>>(() => {
		if (!unref(formStateShouldValidate)) return {};
		const formRulesValue = resolveValue(formRulesParam);
		return formRulesValue ?? {};
	});
	return {
		formRules,
	};
}

type ReactiveValue<T> = T | (() => T) | Readonly<Ref<T>>;
function resolveValue<T>(param: T | (() => T) | Readonly<Ref<T>>): T {
	if (isRef(param)) return param.value;
	else if (typeof param === 'function') {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		return (param as any)();
	}
	return param;
}
