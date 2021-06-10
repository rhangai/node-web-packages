// prettier-ignore
type FormDefinitionValue<T> =
	T extends ReadonlyArray<infer U> ? Array<Exclude<FormDefinitionValue<U>, null>> :
	T extends Array<infer U> ? Array<Exclude<FormDefinitionValue<U>, null>> :
	T extends Record<string, any> ? (T | null) :
	T;

export type FormDefinition<T extends Record<string, unknown>> = {
	-readonly [K in keyof T]-?: FormDefinitionValue<T[K]>;
};

// prettier-ignore
type FormTypeValue<T> =
	T extends ReadonlyArray<infer U> ? Array<FormTypeValue<U>> :
	T extends Array<infer U> ? Array<FormTypeValue<U>> :
	T extends {} ? FormType<T> :
	T;

export type FormType<T extends Record<string, unknown>> = {
	-readonly [K in keyof T]-?: FormTypeValue<T[K]>;
};
