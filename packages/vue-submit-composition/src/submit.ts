import { ComputedRef } from '@vue/composition-api';

type SubmitReactiveOptions<T> = T | ComputedRef<T> | (() => T);
type SubmitPromiseOrValue<T> = T | Promise<T>;

type UseSubmitOptionsOnErrorParam = {
	error: Error;
	isValidationError: boolean;
};
type UseSubmitOptionsCallback<Param, TNotification> = {
	(result: Param): SubmitPromiseOrValue<boolean | void | TNotification>;
};

type UseSubmitOptions<TRequestOptions, TResult, TNotification, TConfirmation> = {
	confirm?: SubmitReactiveOptions<null | boolean | TConfirmation>;
	onSuccess?: UseSubmitOptionsCallback<TResult, TNotification>;
	onError?: UseSubmitOptionsCallback<UseSubmitOptionsOnErrorParam, TNotification>;
};

type CreateUseSubmitResult<TRequestOptions, TResult, TNotification, TConfirmation> = {
	request(options: SubmitReactiveOptions<TRequestOptions>): SubmitPromiseOrValue<TResult>;
	useNotification?(options: SubmitReactiveOptions<TNotification>): {
		notify(options: TNotification): void;
	};
	useConfirmation?(options: SubmitReactiveOptions<TConfirmation>): {
		confirm(options: TConfirmation): SubmitPromiseOrValue<boolean>;
	};
};

export function createUseSubmit<Request, Notification, Confirmation>() {}
