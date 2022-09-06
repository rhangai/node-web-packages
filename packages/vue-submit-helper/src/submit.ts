import { computed, ref, set, del, ComputedRef } from 'vue-demi';
import { submitValidate, VueSubmitValidateItem } from './validate';

export type UseSubmitHelperOptions<TArg, TResult> = {
	validate?: VueSubmitValidateItem;
	prepare?: (arg: TArg) => undefined | null | boolean | Promise<boolean | null | undefined>;
	onSuccess?: (result: TResult, arg: TArg) => void | Promise<void>;
	onError?: (error: unknown, arg: TArg) => void | Promise<void>;
	onValidateError?: (error: unknown, arg: TArg) => void | Promise<void>;
};

export type UseSubmitHelperResult<TArg, TResult> = {
	submit(arg: TArg): Promise<TResult>;
	submitting: ComputedRef<boolean>;
};

// prettier-ignore
export type UseSubmitHelperMultipleResult<TArg, TResult> = {
	submit(arg: TArg): Promise<TResult>;
	submittingAny: ComputedRef<boolean>;
	submittingMap: ComputedRef<Readonly<Record<string, boolean>>>;
	isSubmitting(args: TArg): boolean;
	isSubmitDisabled(args: TArg): boolean;
};

/**
 * Helper function for single submission
 */
export function useSubmitHelper<TArg = void, TResult = unknown>(
	request: (arg: TArg) => TResult | Promise<TResult>,
	options?: UseSubmitHelperOptions<TArg, TResult>
): UseSubmitHelperResult<TArg, TResult> {
	const { submit, submittingAny } = useSubmitHelperMultiple(request, () => '', {
		...options,
	});
	return {
		submit,
		submitting: submittingAny,
	};
}

/**
 * Helper function for multiple submission
 * @returns
 */
export function useSubmitHelperMultiple<TArg, TResult = unknown>(
	request: (arg: TArg) => TResult | Promise<TResult>,
	keyGetter: (arg: TArg) => string | number,
	options: UseSubmitHelperOptions<TArg, TResult> = {}
): UseSubmitHelperMultipleResult<TArg, TResult> {
	const submittingMap = ref<Record<string | number, boolean>>({});
	const submittingAny = computed(() => {
		const values = Object.values(submittingMap.value);
		if (values.length <= 0) return false;
		return values.findIndex((c) => c === true) >= 0;
	});
	const doSubmit = async (arg: TArg): Promise<{ result: TResult } | { error: unknown }> => {
		try {
			if (options.validate) {
				const validateResult = await submitValidate(options.validate);
				if (!validateResult.valid) {
					await options.onValidateError?.(validateResult.error, arg);
					return {
						error: validateResult.error ?? new Error('validation'),
					};
				}
			}

			if (options.prepare) {
				const prepareResult = await options.prepare(arg);
				if (prepareResult === false) return { error: new Error(`Aborted`) };
			}

			const result = await request(arg);
			await options.onSuccess?.(result, arg);
			return { result };
		} catch (err) {
			await options.onError?.(err, arg);
			// istanbul ignore next
			const error = err ?? new Error();
			return { error };
		}
	};
	const submit = async (arg: TArg): Promise<TResult> => {
		const key = keyGetter(arg);
		if (submittingMap.value[key]) throw new Error(`Already submitting`);
		set(submittingMap.value, key, true);
		try {
			const submitResult = await doSubmit(arg);
			if ('error' in submitResult) throw submitResult.error;
			return submitResult.result;
		} finally {
			del(submittingMap.value, key);
		}
	};
	const isSubmitting = (arg: TArg) => {
		const key = keyGetter(arg);
		return !!submittingMap.value[key];
	};

	const isSubmitDisabled = (arg: TArg) => {
		const key = keyGetter(arg);
		return submittingAny.value && !submittingMap.value[key];
	};

	return {
		submit,
		submittingAny,
		submittingMap,
		isSubmitting,
		isSubmitDisabled,
	};
}
