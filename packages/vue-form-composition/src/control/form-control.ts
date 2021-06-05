import { ComputedRef, unref, reactive, computed, inject, provide, InjectionKey } from '@vue/composition-api';

export type FormControl = {
	disabled: boolean;
	readonly: boolean;
	shouldValidate: boolean;
};

export type FormControlProvider = {
	disabled?: boolean | null | undefined | ComputedRef<boolean | null | undefined>;
	readonly?: boolean | null | undefined | ComputedRef<boolean | null | undefined>;
	shouldValidate?: boolean | null | undefined | ComputedRef<boolean | null | undefined>;
};

const FORM_CONTROL_KEY: InjectionKey<FormControl> = '@rhangai/vue-form-composition(form-control)' as any;

export function useFormControl() {
	let formControl = inject(FORM_CONTROL_KEY, null);
	if (formControl == null) {
		formControl = {
			disabled: false,
			readonly: false,
			shouldValidate: true,
		};
	}
	return { formControl };
}

export function provideFormControl(provider: FormControlProvider) {
	const { formControl: formControlParent } = useFormControl();
	const formControl: FormControl = reactive({
		readonly: computed(() => unref(provider.readonly) ?? formControlParent.readonly),
		disabled: computed(() => unref(provider.disabled) ?? formControlParent.disabled),
		shouldValidate: computed(() => unref(provider.shouldValidate) ?? formControlParent.shouldValidate),
	});
	provide(FORM_CONTROL_KEY, formControl);
	return { formControl };
}
