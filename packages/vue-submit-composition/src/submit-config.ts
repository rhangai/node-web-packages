// prettier-ignore
export type SubmitConfigRequestFunction<TRequestConfig, TResponse> = (config: TRequestConfig) => TResponse | Promise<TResponse>;

export type SubmitConfig<TRequestConfig, TResponse> = {
	request: SubmitConfigRequestFunction<TRequestConfig, TResponse>;
};

type SubmitConfigFromRequestFunction<T> =
	// prettier-ignore
	T extends SubmitConfigRequestFunction<infer TRequestConfig, infer TResponse> ? SubmitConfig<TRequestConfig, TResponse>
	: SubmitConfig<unknown, unknown>;

export function createSubmitConfig<TRequestFunction extends SubmitConfigRequestFunction<any, any>>() {
	const submitConfig: Partial<SubmitConfigFromRequestFunction<TRequestFunction>> = {};
	const registerSubmit = (fn: TRequestFunction) => {
		submitConfig.request = fn;
	};
	return {
		submitConfig: submitConfig as SubmitConfigFromRequestFunction<TRequestFunction>,
		registerSubmit,
	};
}
