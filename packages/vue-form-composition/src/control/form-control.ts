import {
	Ref,
	ComputedRef,
	ref,
	unref,
	watch,
	reactive,
	computed,
	inject,
	provide,
	InjectionKey,
} from '@vue/composition-api';
import { FormControlPropsType } from './form-control-props';

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

const FORM_CONTROL_KEY: InjectionKey<FormControl> = '@rhangai/vue-form-composition/form-control' as any;

function useFormControlInternal(formControlProvider: FormControlProvider) {
	const formControlParent = inject(FORM_CONTROL_KEY, null);
	let formControl: FormControl;
	if (!formControlParent) {
		// prettier-ignore
		formControl = reactive({
			readonly: computed(() => unref(formControlProvider.readonly) ?? false),
			disabled: computed(() => unref(formControlProvider.disabled) ?? false),
			shouldValidate: computed(() => unref(formControlProvider.shouldValidate) ?? true),
		});
	} else {
		// prettier-ignore
		formControl = reactive({
			readonly: computed(() => unref(formControlProvider.readonly) ?? formControlParent.readonly),
			disabled: computed(() => unref(formControlProvider.disabled) ?? formControlParent.disabled),
			shouldValidate: computed(() => unref(formControlProvider.shouldValidate) ?? formControlParent.shouldValidate),
		});
	}
	return { formControl, formControlParent };
}

export function useFormControl(props: FormControlPropsType) {
	return useFormControlInternal(props);
}

export function provideFormControl(formControlProvider: FormControlProvider) {
	const submitting = ref(false);
	const { formControl, formControlParent } = useFormControlInternal({
		...formControlProvider,
		disabled: computed(() => (submitting.value ? true : unref(formControlProvider.disabled))),
	});
	provide(FORM_CONTROL_KEY, formControl);
	const formControlUseSubmitting = (submittingParam: Ref<boolean>) => {
		watch(
			submittingParam,
			(p) => {
				submitting.value = p;
			},
			{ immediate: true }
		);
	};
	return { formControl, formControlParent, formControlUseSubmitting };
}
