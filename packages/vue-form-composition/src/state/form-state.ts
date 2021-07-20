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
	readonly disabled: boolean;
	readonly readonly: boolean;
	readonly shouldValidate: boolean;
};

export type FormStateProvider = {
	readonly disabled?: boolean | null | undefined | ComputedRef<boolean | null | undefined>;
	readonly readonly?: boolean | null | undefined | ComputedRef<boolean | null | undefined>;
	readonly shouldValidate?: boolean | null | undefined | ComputedRef<boolean | null | undefined>;
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
		readonly: computed(() => unref(provider.readonly) ?? formStateParent.readonly),
		disabled: computed(() => unref(provider.disabled) ?? formStateParent.disabled),
		shouldValidate: computed(
			() => unref(provider.shouldValidate) ?? formStateParent.shouldValidate
		),
	});
	provide(FORM_STATE_KEY, formState);
	return { formState };
}
