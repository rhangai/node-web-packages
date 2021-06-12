import { ComputedRef, isRef } from '@vue/composition-api';

export type SubmitReactiveOption<T, TParams extends any[]> = T | ComputedRef<T> | ((...params: TParams) => T);
export type SubmitPromiseOrValue<T> = T | Promise<T>;

export function submitReactiveOptionResolve<T, TParams extends any[]>(
	options: SubmitReactiveOption<T, TParams>,
	...params: TParams
): T;
export function submitReactiveOptionResolve<T, TParams extends any[]>(
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
