import { computed, ref, type Ref } from 'vue';
import { submitValidate, type VueSubmitValidateItem } from './validate';

type MaybePromise<T> = T | Promise<T>;

/**
 * Default types for useSubmit family functions
 */
export type UseSubmitHelperDefaults = {
	/**
	 * Helper function to prepare for submission
	 */
	prepare?: (arg: unknown) => MaybePromise<boolean | null | undefined>;
	/**
	 * Callback when the submission is successful
	 */
	onSuccess?: (result: unknown, arg: unknown) => MaybePromise<void>;
	/**
	 * Callback when the submission errors
	 */
	onError?: (error: unknown, arg: unknown) => MaybePromise<void>;
	/**
	 * Callback when the validation fails
	 */
	onValidateError?: (error: unknown, arg: unknown) => MaybePromise<void>;
};

/**
 * The helper options
 */
export interface UseSubmitHelperOptions<TArg, TResult> {
	/**
	 * The submission function. Called when the function
	 * @param arg
	 * @returns
	 */
	submitFn: (arg: TArg) => MaybePromise<TResult>;
	/**
	 * Validated items before submitting
	 */
	validate?: VueSubmitValidateItem;
	/**
	 * Helper function to prepare for submission
	 */
	prepare?: (arg: NoInfer<TArg>) => MaybePromise<boolean | null | undefined>;
	/**
	 * Callback when the submission is successful
	 */
	onSuccess?: (result: NoInfer<TResult>, arg: NoInfer<TArg>) => MaybePromise<void>;
	/**
	 * Callback when the submission errors
	 */
	onError?: (error: unknown, arg: NoInfer<TArg>) => MaybePromise<void>;
	/**
	 * Callback when the validation fails
	 */
	onValidateError?: (error: unknown, arg: NoInfer<TArg>) => MaybePromise<void>;
}

/**
 *
 */
export interface UseSubmitHelperResult<TResult> {
	/**
	 * Handle the submission. Calling the submitFn if the property is set
	 */
	handleSubmit: () => void;
	/**
	 * Handle the submission with an event
	 */
	handleSubmitEvent: (ev: Event) => void;
	/**
	 * Submit Async
	 */
	submitAsync: () => Promise<TResult>;
	/**
	 * Flag to validate if the user is submitting
	 */
	submitting: Readonly<Ref<boolean>>;
}

/**
 * Helper function for single submission
 */
export function useSubmitHelper<TResult = unknown>(
	options: UseSubmitHelperOptions<void, TResult>,
	defaults?: UseSubmitHelperDefaults
): UseSubmitHelperResult<TResult> {
	const { handleSubmit, handleSubmitEvent, submitAsync, submittingAny } = useSubmitHelperMultiple(
		{
			...options,
			keyFn: () => '',
		},
		defaults
	);
	return {
		handleSubmit() {
			handleSubmit();
		},
		handleSubmitEvent(ev) {
			handleSubmitEvent(ev);
		},
		submitAsync() {
			return submitAsync();
		},
		submitting: submittingAny,
	};
}

/**
 * Same as {@link UseSubmitHelperResult}
 */
export interface UseSubmitArgHelperResult<TArg, TResult> {
	/**
	 * Same as {@link UseSubmitHelperResult.handleSubmit handleSubmit} (with an argument)
	 */
	handleSubmit: (arg: TArg) => void;
	/**
	 * Same as {@link UseSubmitHelperResult.handleSubmitEvent handleSubmitEvent} (with an argument)
	 */
	handleSubmitEvent: (ev: Event, arg: TArg) => void;
	/**
	 * Same as {@link UseSubmitHelperResult.submitAsync submitAsync} (with an argument)
	 */
	submitAsync: (arg: TArg) => Promise<TResult>;
	/**
	 * Same as {@link UseSubmitHelperResult.submitting}
	 */
	submitting: Readonly<Ref<boolean>>;
}

/**
 * {@link useSubmitHelper} but using an argument.
 *
 * The {@link UseSubmitHelperOptions.submitFn submitFn} property now accepts an argument, and so does the results
 * {@link UseSubmitArgHelperResult.handleSubmit handleSubmit},
 * {@link UseSubmitArgHelperResult.handleSubmitEvent handleSubmitEvent},
 * {@link UseSubmitArgHelperResult.submitAsync submitAsync}
 */
export function useSubmitArgHelper<TArg, TResult = unknown>(
	options: UseSubmitHelperOptions<TArg, TResult>,
	defaults?: UseSubmitHelperDefaults
): UseSubmitArgHelperResult<TArg, TResult> {
	const { handleSubmit, handleSubmitEvent, submitAsync, submittingAny } = useSubmitHelperMultiple(
		{
			...options,
			keyFn: () => '',
		},
		defaults
	);
	return {
		handleSubmit,
		handleSubmitEvent,
		submitAsync,
		submitting: submittingAny,
	};
}

/**
 * Options for the use submit multiple
 *
 * Accepts an extra argument to get the key
 */
export interface UseSubmitHelperMultipleOptions<TArg, TResult>
	extends UseSubmitHelperOptions<TArg, TResult> {
	/**
	 * Get the key from the item
	 */
	keyFn: (item: TArg) => PropertyKey;
}

/**
 * Options when calling multiple submission
 */
export interface UseSubmitHelperMultipleResult<TArg, TResult> {
	/**
	 * Handle the submission, normaly used with events but without explicitly passing the event
	 */
	handleSubmit: (arg: TArg) => void;
	/**
	 * Handle the submission, normally used with events
	 */
	handleSubmitEvent: (ev: Event, arg: TArg) => void;
	/**
	 * Submits the item and returns whatever the submitFn function resolves to.
	 */
	submitAsync: (arg: TArg) => Promise<TResult>;
	/**
	 * Check if any submission is happening
	 */
	submittingAny: Readonly<Ref<boolean>>;
	/**
	 * Map of submitting items
	 */
	submittingMap: Readonly<Ref<Readonly<Record<PropertyKey, boolean>>>>;
	/**
	 * Check if the given item is being submitted
	 */
	isSubmitting: (args: TArg) => boolean;
	/**
	 * Check if the submit is disabled for the given item.
	 * It returns true if there is any ongoing submission, but not the item itself
	 */
	isSubmitDisabled: (args: TArg) => boolean;
}

/**
 * Helper function for multiple submission
 * @returns
 */
export function useSubmitHelperMultiple<TArg, TResult = unknown>(
	options: UseSubmitHelperMultipleOptions<TArg, TResult>,
	defaults?: UseSubmitHelperDefaults
): UseSubmitHelperMultipleResult<TArg, TResult> {
	const submittingMap = ref<Record<PropertyKey, boolean>>({});
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
					await defaults?.onValidateError?.(validateResult.error, arg);
					await options.onValidateError?.(validateResult.error, arg);
					return {
						error: validateResult.error ?? new Error('validation'),
					};
				}
			}
			if (defaults?.prepare) {
				const prepareResult = await defaults.prepare(arg);
				if (prepareResult === false) {
					return { error: new Error(`Aborted`) };
				}
			}
			if (options.prepare) {
				const prepareResult = await options.prepare(arg);
				if (prepareResult === false) {
					return { error: new Error(`Aborted`) };
				}
			}

			const result = await options.submitFn(arg);
			await defaults?.onSuccess?.(result, arg);
			await options.onSuccess?.(result, arg);
			return { result };
		} catch (err) {
			await defaults?.onError?.(err, arg);
			await options.onError?.(err, arg);
			// istanbul ignore next
			const error = err ?? new Error();
			return { error };
		}
	};
	const submitAsync = async (arg: TArg): Promise<TResult> => {
		const key = options.keyFn(arg);
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
	const handleSubmitEvent = (ev: Event, arg: TArg): void => {
		ev.preventDefault();
		ev.stopPropagation();
		void submitAsync(arg);
	};
	const isSubmitting = (arg: TArg) => {
		const key = options.keyFn(arg);
		return !!submittingMap.value[key];
	};
	const isSubmitDisabled = (arg: TArg) => {
		const key = options.keyFn(arg);
		return submittingAny.value && !submittingMap.value[key];
	};
	return {
		handleSubmit,
		handleSubmitEvent,
		submitAsync,
		submittingAny,
		submittingMap,
		isSubmitting,
		isSubmitDisabled,
	};
}
