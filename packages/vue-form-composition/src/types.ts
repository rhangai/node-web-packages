// prettier-ignore
type FormDefinitionValue<T> =
	T extends ReadonlyArray<infer U> ? Array<FormDefinitionValue<U>> :
	T extends Array<infer U> ? Array<FormDefinitionValue<U>> :
	T extends Record<string, unknown> ? Partial<FormDefinition<T>> :
	T;

export type FormDefinition<T extends Record<string, unknown>> = {
	-readonly [K in keyof T]-?: FormDefinitionValue<T[K]> | null;
};

// prettier-ignore
type FormTypeValue<T> =
	T extends ReadonlyArray<infer U> ? Array<FormTypeValue<U>> :
	T extends Array<infer U> ? Array<FormTypeValue<U>> :
	T extends Record<string, unknown> ? FormType<T> :
	T;

export type FormType<T extends Record<string, unknown>> = {
	-readonly [K in keyof T]-?: FormTypeValue<T[K]>;
};
