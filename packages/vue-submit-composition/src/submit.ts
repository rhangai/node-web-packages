/* eslint-disable arrow-body-style */
import { computed, inject, reactive, ref, set } from '@vue/composition-api';
import { SubmitConfig, SubmitConfigHandle } from './submit-config';
import { SubmitReactiveOption, SubmitReactiveExtract, submitReactiveOptionResolve } from './utils';
import { validateItem, ValidateItem } from './validate';

type SubmitPromiseOrValue<T> = T | Promise<T>;

type SubmitRequestOptions<TResult, TNotification, TConfirmation> = {
	request: () => SubmitPromiseOrValue<TResult>;
	validate?: ValidateItem;
	confirm?: SubmitReactiveOption<null | false | TConfirmation, []>;
	notifySuccess?: SubmitReactiveOption<TNotification | false, [TResult]>;
	onSuccess?: (result: TResult) => SubmitPromiseOrValue<void>;
	notifyError?: SubmitReactiveOption<TNotification | false, [Error]>;
	onError?: (error: Error) => SubmitPromiseOrValue<void>;
	notifyValidationError?: SubmitReactiveOption<TNotification | false, []>;
	onValidationError?: () => SubmitPromiseOrValue<void>;
};

type UseSubmitOptions<TRequestConfig, TResult, TNotification, TConfirmation> = TRequestConfig &
	Omit<SubmitRequestOptions<TResult, TNotification, TConfirmation>, 'request'> & {
		requestConfig?: Partial<TRequestConfig>;
	};

export type CreateUseSubmitOptions<TRequestConfig, TResult, TNotification, TConfirmation> = {
	submitConfig: SubmitConfigHandle<TRequestConfig, TResult>;
	useNotification(): {
		notify(options: TNotification): SubmitPromiseOrValue<void>;
	};
	useConfirmation(): {
		confirm(options: TConfirmation): SubmitPromiseOrValue<boolean>;
	};
	defaults: {
		notifySuccess: SubmitReactiveOption<TNotification, [TResult]>;
		notifyError: SubmitReactiveOption<TNotification, [Error]>;
		notifyValidationError: SubmitReactiveOption<TNotification, []>;
	};
};

export type SubmitRequestOptionsDefineType<TResult, RequestOptions extends SubmitRequestOptions<any, any, any>> =
	RequestOptions extends SubmitRequestOptions<any, infer TNotification, infer TConfirmation>
		? SubmitRequestOptions<TResult, TNotification, TConfirmation>
		: SubmitRequestOptions<TResult, unknown, unknown>;

// prettier-ignore
export type CreateUseSubmitOptionsType<TUseSubmit extends (...args: any[]) => any> =
	SubmitReactiveExtract<Parameters<TUseSubmit>[0]>;

// prettier-ignore
export type CreateUseSubmitRequestOptionsType<TResult, TUseSubmit extends (...args: any[]) => any> =
	SubmitRequestOptionsDefineType<TResult, SubmitReactiveExtract<Parameters<TUseSubmit>[0]>>;

export function createUseSubmit<TRequestConfig, TResult, TNotification, TConfirmation>(
	createSubmitOptions: CreateUseSubmitOptions<TRequestConfig, TResult, TNotification, TConfirmation>
) {
	type TUseSubmitOptions = UseSubmitOptions<TRequestConfig, TResult, TNotification, TConfirmation>;
	type SubmitRequestOptionsType<TRequestResult> = SubmitRequestOptions<TRequestResult, TNotification, TConfirmation>;

	const { submitConfig: submitConfigHandle, useNotification, useConfirmation, defaults } = createSubmitOptions;

	const mapRequestOptions = <TParams extends any[]>(
		submitConfig: SubmitConfig<TRequestConfig, TResult>,
		options: SubmitReactiveOption<TUseSubmitOptions, TParams>,
		params: TParams
	) => {
		const {
			validate,
			confirm,
			notifyError,
			notifySuccess,
			notifyValidationError,
			onError,
			onSuccess,
			onValidationError,
			requestConfig,
			...config
		} = submitReactiveOptionResolve(options, ...params);
		return {
			request: () => submitConfig.request({ ...(config as any), ...requestConfig }),
			confirm,
			validate,
			notifyError,
			notifySuccess,
			notifyValidationError,
			onError,
			onSuccess,
			onValidationError,
		};
	};

	const useSubmitRequestBase = () => {
		const { notify } = useNotification();
		const { confirm } = useConfirmation();
		const submitNotify = async <TParams extends any[]>(
			params: TParams,
			notificationParam: SubmitReactiveOption<TNotification | false, TParams> | null | undefined,
			defaultsParam: SubmitReactiveOption<TNotification, TParams>
		) => {
			const notification = submitReactiveOptionResolve(notificationParam, ...params);
			if (notification === false) return;
			const notificationDefaults = submitReactiveOptionResolve(defaultsParam, ...params);
			await notify({ ...notificationDefaults, ...notification });
		};
		const doSubmitRequest = async (options: SubmitRequestOptionsType<any>) => {
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

	const useSubmitRequest = <TRequestResult, TParams extends any[]>(
		options: SubmitReactiveOption<SubmitRequestOptionsType<TRequestResult>, TParams>
	) => {
		const { doSubmitRequest } = useSubmitRequestBase();
		const submitting = ref(false);
		const submit = async (...params: TParams) => {
			if (submitting.value) throw new Error(`Already submitting`);
			submitting.value = true;
			try {
				await doSubmitRequest(submitReactiveOptionResolve(options, ...params));
			} finally {
				submitting.value = false;
			}
		};
		return { submit, submitting };
	};

	const useSubmit = <TParams extends any[]>(options: SubmitReactiveOption<TUseSubmitOptions, TParams>) => {
		const submitConfig = inject(submitConfigHandle.key);
		if (!submitConfig) throw new Error(`Did you call provideSubmitConfig?`);
		return useSubmitRequest<TResult, TParams>((...params: TParams) =>
			mapRequestOptions(submitConfig, options, params)
		);
	};

	const useSubmitRequestMultiple = <TRequestResult, TParams extends any[]>(
		options: SubmitReactiveOption<SubmitRequestOptionsType<TRequestResult>, TParams>
	) => {
		const { doSubmitRequest } = useSubmitRequestBase();

		const submitting = reactive<Record<string, boolean>>({});
		const submittingAny = computed(() => {
			const values = Object.values(submitting);
			if (values.length <= 0) return false;
			return values.findIndex((c) => c === true) < 0;
		});
		const submit = async (key: string | number, ...params: TParams) => {
			if (key == null) throw new Error(`No key when using submitMultiple`);
			if (submitting[key]) throw new Error(`Already submitting`);
			set(submitting, key, true);
			try {
				await doSubmitRequest(submitReactiveOptionResolve(options, ...params));
			} finally {
				set(submitting, key, false);
			}
		};
		return { submit, submitting, submittingAny };
	};

	const useSubmitMultiple = <TParams extends any[]>(options: SubmitReactiveOption<TUseSubmitOptions, TParams>) => {
		const submitConfig = inject(submitConfigHandle.key);
		if (!submitConfig) throw new Error(`Did you call provideSubmitConfig?`);
		return useSubmitRequestMultiple<TResult, TParams>((...params: TParams) =>
			mapRequestOptions(submitConfig, options, params)
		);
	};

	return {
		useSubmit,
		useSubmitMultiple,
		useSubmitRequest,
		useSubmitRequestMultiple,
	};
}
