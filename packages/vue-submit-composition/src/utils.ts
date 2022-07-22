import { Ref, isRef } from 'vue-demi';

export type SubmitReactiveOption<T, TParams extends unknown[]> =
	| T
	| Readonly<Ref<T>>
	| ((...params: TParams) => T);
export type SubmitPromiseOrValue<T> = T | Promise<T>;

export function submitReactiveOptionResolve<T, TParams extends unknown[]>(
	options: SubmitReactiveOption<T, TParams>,
	...params: TParams
): T;
export function submitReactiveOptionResolve<T, TParams extends unknown[]>(
	options: SubmitReactiveOption<T, TParams> | null | undefined,
	...params: TParams
): T | null {
	if (options == null) {
		return null;
	} else if (isRef(options)) {
		return options.value;
	} else if (typeof options === 'function') {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		return (options as any)(...params);
	}
	return options as T;
}
