import { computed, ref, type Ref } from 'vue';
import { submitValidate, type VueSubmitValidateItem } from './validate';

export type UseSubmitHelperOptions<TArg, TResult> = {
	validate?: VueSubmitValidateItem;
	prepare?: (arg: TArg) => undefined | null | boolean | Promise<boolean | null | undefined>;
	onSuccess?: (result: TResult, arg: TArg) => void | Promise<void>;
	onError?: (error: unknown, arg: TArg) => void | Promise<void>;
	onValidateError?: (error: unknown, arg: TArg) => void | Promise<void>;
};

// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
type Fn<TArg, TResult> = TArg extends void | never ? () => TResult : (arg: TArg) => TResult;

export type UseSubmitHelperResult<TArg, TResult> = {
	handleSubmit: Fn<TArg, void>;
	submitAsync: Fn<TArg, Promise<TResult>>;
	submitting: Readonly<Ref<boolean>>;
};

// prettier-ignore
export type UseSubmitHelperMultipleResult<TArg, TResult> = {
	handleSubmit: Fn<TArg, void>;
	submitAsync: Fn<TArg, Promise<TResult>>;
	submittingAny: Readonly<Ref<boolean>>;
	submittingMap: Readonly<Ref<Readonly<Record<string, boolean>>>>;
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
	const { handleSubmit, submitAsync, submittingAny } = useSubmitHelperMultiple(
		request,
		() => '',
		{
			...options,
		}
	);
	return {
		handleSubmit,
		submitAsync,
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
		if (values.length <= 0) {
			return false;
		}
		return values.findIndex((c) => c) >= 0;
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
				if (prepareResult === false) {
					return { error: new Error(`Aborted`) };
				}
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
	const submitAsync = async (arg: TArg): Promise<TResult> => {
		const key = keyGetter(arg);
		if (submittingMap.value[key]) {
			throw new Error(`Already submitting`);
		}
		submittingMap.value[key] = true;
		try {
			const submitResult = await doSubmit(arg);
			if ('error' in submitResult) {
				throw submitResult.error;
			}
			return submitResult.result;
		} finally {
			// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
			delete submittingMap.value[key];
		}
	};
	const handleSubmit = (arg: TArg): void => {
		void submitAsync(arg);
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
		handleSubmit: handleSubmit as Fn<TArg, void>,
		submitAsync: submitAsync as Fn<TArg, Promise<TResult>>,
		submittingAny,
		submittingMap,
		isSubmitting,
		isSubmitDisabled,
	};
}
