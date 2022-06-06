import { Ref, unref, computed, inject, provide, InjectionKey } from '@vue/composition-api';

export type FormStateContext = {
	readonly formStateReadonly: Readonly<Ref<boolean>> | boolean;
	readonly formStateDisabled: Readonly<Ref<boolean>> | boolean;
	readonly formStateShouldValidate: Readonly<Ref<boolean>> | boolean;
};

type ValueOrRef<T> = T | Readonly<Ref<T>>;

export type FormStateProviderOptions = {
	readonly readonly?: ValueOrRef<boolean | null | undefined>;
	readonly disabled?: ValueOrRef<boolean | null | undefined>;
	readonly shouldValidate?: ValueOrRef<boolean | null | undefined>;
	readonly forceReadonly?: ValueOrRef<boolean | null | undefined>;
	readonly forceDisabled?: ValueOrRef<boolean | null | undefined>;
};

const FORM_STATE_KEY: InjectionKey<FormStateContext> =
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	'@rhangai/vue-form-composition(form-state)' as any;

export function injectFormState(): FormStateContext {
	let formState = inject(FORM_STATE_KEY, null);
	if (formState == null) {
		formState = {
			formStateReadonly: false,
			formStateDisabled: false,
			formStateShouldValidate: true,
		};
	}
	return formState;
}

export function useFormState(options: FormStateProviderOptions = {}): FormStateContext {
	const formStateParent = injectFormState();
	const formState: FormStateContext = {
		formStateReadonly: computed(() => {
			const isReadonly = unref(options.forceReadonly);
			if (isReadonly != null) return isReadonly;
			return unref(options.readonly) || unref(formStateParent.formStateReadonly);
		}),
		formStateDisabled: computed(() => {
			const isDisabled = unref(options.forceDisabled);
			if (isDisabled != null) return isDisabled;
			return unref(options.disabled) || unref(formStateParent.formStateDisabled);
		}),
		formStateShouldValidate: computed(() => {
			return unref(options.shouldValidate) ?? unref(formStateParent.formStateShouldValidate);
		}),
	};
	return formState;
}

export function provideFormState(provider: FormStateProviderOptions): FormStateContext {
	const formState = useFormState(provider);
	provide(FORM_STATE_KEY, formState);
	return formState;
}
