import { InjectionKey, provide } from '@vue/composition-api';

// prettier-ignore
export type SubmitConfigRequestFunction<TRequestConfig, TResponse> = (config: TRequestConfig) => TResponse | Promise<TResponse>;

export type SubmitConfigHandle<TRequestConfig, TResponse> = {
	key: InjectionKey<SubmitConfig<TRequestConfig, TResponse>>;
};

export type SubmitConfig<TRequestConfig, TResponse> = {
	request: SubmitConfigRequestFunction<TRequestConfig, TResponse>;
};

export function createSubmitConfig<TRequestConfig, TResponse>() {
	type SubmitConfigType = SubmitConfig<TRequestConfig, TResponse>;
	type SubmitConfigHandleType = SubmitConfigHandle<TRequestConfig, TResponse>;

	const submitConfigHandle: SubmitConfigHandleType = {
		key: Symbol('@rhangai/vue-submit-composition/handle'),
	};
	const provideSubmitConfig = (config: SubmitConfigType) => {
		provide(submitConfigHandle.key, config);
	};
	return {
		submitConfig: submitConfigHandle,
		provideSubmitConfig,
	};
}
