/* eslint-disable arrow-body-style */
import { computed, reactive, ref, set } from '@vue/composition-api';
import { SubmitReactiveOption, submitReactiveOptionResolve } from './utils';
import { validateItem, ValidateItem } from './validate';

type Awaited<T> = T extends Promise<infer U> ? U : T;
type SubmitPromiseOrValue<T> = T | Promise<T>;

export type UseSubmitBaseOptions<TResult, TNotification, TConfirmation> = {
	request: () => SubmitPromiseOrValue<Awaited<TResult>>;
	validate?: ValidateItem;
	confirm?: SubmitReactiveOption<null | false | TConfirmation, []>;
	notifySuccess?: SubmitReactiveOption<TNotification | false, [Awaited<TResult>]>;
	onSuccess?: (result: Awaited<TResult>) => SubmitPromiseOrValue<void>;
	notifyError?: SubmitReactiveOption<TNotification | false, [Error]>;
	onError?: (error: Error) => SubmitPromiseOrValue<void>;
	notifyValidationError?: SubmitReactiveOption<TNotification | false, []>;
	onValidationError?: () => SubmitPromiseOrValue<void>;
};

export type CreateUseSubmitOptions<TNotification, TConfirmation> = {
	useNotification(): {
		notify(options: TNotification): SubmitPromiseOrValue<void>;
	};
	useConfirmation(): {
		confirm(options: TConfirmation): SubmitPromiseOrValue<boolean>;
	};
	defaults: {
		notifySuccess: SubmitReactiveOption<TNotification, [unknown]>;
		notifyError: SubmitReactiveOption<TNotification, [Error]>;
		notifyValidationError: SubmitReactiveOption<TNotification, []>;
	};
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function createUseSubmit<TNotification, TConfirmation>(
	createSubmitOptions: CreateUseSubmitOptions<TNotification, TConfirmation>
) {
	type UseSubmitOptionsType<TRequestResult> = UseSubmitBaseOptions<TRequestResult, TNotification, TConfirmation>;
	const { useNotification, useConfirmation, defaults } = createSubmitOptions;
	const useSubmitBase = () => {
		const { notify } = useNotification();
		const { confirm } = useConfirmation();
		const submitNotify = async <TParams extends unknown[]>(
			params: TParams,
			notificationParam: SubmitReactiveOption<TNotification | false, TParams> | null | undefined,
			defaultsParam: SubmitReactiveOption<TNotification, TParams>
		) => {
			const notification = submitReactiveOptionResolve(notificationParam, ...params);
			if (notification === false) return;
			const notificationDefaults = submitReactiveOptionResolve(defaultsParam, ...params);
			await notify({ ...notificationDefaults, ...notification });
		};
		const doSubmitRequest = async (options: UseSubmitOptionsType<unknown>) => {
			try {
				if (options.validate != null) {
					const isValid = await validateItem(options.validate);
					if (!isValid) {
						await options.onValidationError?.();
						await submitNotify([], options.notifyValidationError, defaults.notifyValidationError);
						return;
					}
				}

				const confirmOptions = submitReactiveOptionResolve(options.confirm);
				if (confirmOptions) {
					const isConfirmation = await confirm(confirmOptions);
					if (!isConfirmation) return;
				}

				const result = await options.request();
				await options.onSuccess?.(result);
				await submitNotify([result], options.notifySuccess, defaults.notifySuccess);
			} catch (err) {
				await options.onError?.(err);
				await submitNotify([err], options.notifyError, defaults.notifyError);
				throw err;
			}
		};
		return { doSubmitRequest };
	};

	const useSubmit = <TRequestResult, TParams extends unknown[]>(
		options: SubmitReactiveOption<SubmitPromiseOrValue<UseSubmitOptionsType<TRequestResult> | null>, TParams>
	) => {
		const { doSubmitRequest } = useSubmitBase();
		const submitting = ref(false);
		const submit = async (...params: TParams) => {
			if (submitting.value) throw new Error(`Already submitting`);
			submitting.value = true;
			try {
				const submitOptions = await submitReactiveOptionResolve(options, ...params);
				if (submitOptions != null) await doSubmitRequest(submitOptions as UseSubmitOptionsType<unknown>);
			} finally {
				submitting.value = false;
			}
		};
		return { submit, submitting };
	};

	const useSubmitMultiple = <TRequestResult, TParams extends unknown[]>(
		options: SubmitReactiveOption<SubmitPromiseOrValue<UseSubmitOptionsType<TRequestResult> | null>, TParams>
	) => {
		const { doSubmitRequest } = useSubmitBase();
		const submitting = ref<Record<string, boolean>>({});
		const submittingAny = computed(() => {
			const values = Object.values(submitting);
			if (values.length <= 0) return false;
			return values.findIndex((c) => c === true) >= 0;
		});
		const submit = async (key: string | number, ...params: TParams) => {
			if (key == null) throw new Error(`No key when using submitMultiple`);
			if (submitting.value[key]) throw new Error(`Already submitting`);
			set(submitting.value, key, true);
			try {
				const submitOptions = await submitReactiveOptionResolve(options, ...params);
				if (submitOptions != null) await doSubmitRequest(submitOptions as UseSubmitOptionsType<unknown>);
			} finally {
				set(submitting.value, key, false);
			}
		};
		return {
			submit,
			submitting,
			submittingAny,
		};
	};

	return {
		useSubmit,
		useSubmitMultiple,
	};
}
