/* eslint-disable arrow-body-style */
import { computed, reactive, ref, set } from '@vue/composition-api';
import { SubmitConfig } from './submit-config';
import { SubmitReactiveOption, submitReactiveOptionResolve } from './utils';

type SubmitPromiseOrValue<T> = T | Promise<T>;

type SubmitRequestOptions<TResult, TNotification, TConfirmation> = {
	request: () => SubmitPromiseOrValue<TResult>;
	validate: () => SubmitPromiseOrValue<boolean>;
	confirm?: SubmitReactiveOption<null | false | TConfirmation, []>;
	notifySuccess: SubmitReactiveOption<TNotification | false, [TResult]>;
	onSuccess?: (result: TResult) => SubmitPromiseOrValue<void>;
	notifyError: SubmitReactiveOption<TNotification | false, [Error]>;
	onError?: (error: Error) => SubmitPromiseOrValue<void>;
	notifyValidationError: SubmitReactiveOption<TNotification | false, []>;
	onValidationError?: () => SubmitPromiseOrValue<void>;
};

export type UseSubmitOptions<TRequestConfig, TResult, TNotification, TConfirmation> = TRequestConfig &
	Omit<SubmitRequestOptions<TResult, TNotification, TConfirmation>, 'request'> & {
		requestConfig?: Partial<TRequestConfig>;
	};

export type CreateUseSubmitOptions<TRequestConfig, TResult, TNotification, TConfirmation> = {
	submitConfig: SubmitConfig<TRequestConfig, TResult>;
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

export function createUseSubmit<TRequestConfig, TResult, TNotification, TConfirmation>(
	createSubmitOptions: CreateUseSubmitOptions<TRequestConfig, TResult, TNotification, TConfirmation>
) {
	type UseSubmitOptionsType = UseSubmitOptions<TRequestConfig, TResult, TNotification, TConfirmation>;
	type SubmitRequestOptionsType = SubmitRequestOptions<TResult, TNotification, TConfirmation>;

	const { submitConfig, useNotification, useConfirmation, defaults } = createSubmitOptions;

	const mapRequestOptions = <TParams extends any[]>(
		options: SubmitReactiveOption<UseSubmitOptionsType, TParams>,
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
			notificationParam: SubmitReactiveOption<TNotification | false, TParams>,
			defaultsParam: SubmitReactiveOption<TNotification, TParams>
		) => {
			const notification = submitReactiveOptionResolve(notificationParam, ...params);
			if (notification === false) return;
			const notificationDefaults = submitReactiveOptionResolve(defaultsParam, ...params);
			await notify({ ...notificationDefaults, ...notification });
		};
		const doSubmitRequest = async (options: SubmitRequestOptionsType) => {
			try {
				const isValid = await options.validate();
				if (!isValid) {
					await options.onValidationError?.();
					await submitNotify([], options.notifyValidationError, defaults.notifyValidationError);
					return;
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

	const useSubmitRequest = <TParams extends any[]>(
		options: SubmitReactiveOption<SubmitRequestOptionsType, TParams>
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

	const useSubmit = <TParams extends any[]>(options: SubmitReactiveOption<UseSubmitOptionsType, TParams>) => {
		return useSubmitRequest<TParams>((...params: TParams) => mapRequestOptions(options, params));
	};

	const useSubmitRequestMultiple = <TParams extends any[]>(
		options: SubmitReactiveOption<SubmitRequestOptionsType, TParams>
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

	const useSubmitMultiple = <TParams extends any[]>(options: SubmitReactiveOption<UseSubmitOptionsType, TParams>) => {
		return useSubmitRequestMultiple<TParams>((...params: TParams) => mapRequestOptions(options, params));
	};

	return {
		useSubmit,
		useSubmitMultiple,
		useSubmitRequest,
		useSubmitRequestMultiple,
	};
}
