import {
	ComputedRef,
	unref,
	reactive,
	computed,
	inject,
	provide,
	InjectionKey,
} from '@vue/composition-api';

export type FormState = {
	readonly readonly: boolean;
	readonly disabled: boolean;
	readonly shouldValidate: boolean;
};

type ValueOrRef<T> = T | ComputedRef<T>;

export type FormStateProvider = {
	readonly readonly?: ValueOrRef<boolean | null | undefined>;
	readonly disabled?: ValueOrRef<boolean | null | undefined>;
	readonly shouldValidate?: ValueOrRef<boolean | null | undefined>;
	readonly forceReadonly?: ValueOrRef<boolean | null | undefined>;
	readonly forceDisabled?: ValueOrRef<boolean | null | undefined>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FORM_STATE_KEY: InjectionKey<FormState> = '@rhangai/vue-form-composition(form-state)' as any;

export type UseFormStateResult = {
	formState: FormState;
};

export function useFormState(): UseFormStateResult {
	let formState = inject(FORM_STATE_KEY, null);
	if (formState == null) {
		formState = {
			disabled: false,
			readonly: false,
			shouldValidate: true,
		};
	}
	return { formState };
}

export function provideFormState(provider: FormStateProvider): UseFormStateResult {
	const { formState: formStateParent } = useFormState();
	const formState: FormState = reactive({
		readonly: computed(() => {
			const isReadonly = unref(provider.forceReadonly);
			if (isReadonly != null) return isReadonly;
			return unref(provider.readonly) || formStateParent.readonly;
		}),
		disabled: computed(() => {
			const isDisabled = unref(provider.forceDisabled);
			if (isDisabled != null) return isDisabled;
			return unref(provider.disabled) || formStateParent.disabled;
		}),
		shouldValidate: computed(() => {
			return unref(provider.shouldValidate) ?? formStateParent.shouldValidate;
		}),
	});
	provide(FORM_STATE_KEY, formState);
	return { formState };
}
