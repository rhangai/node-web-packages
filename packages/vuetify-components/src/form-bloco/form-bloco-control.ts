import { inject, provide, Ref, ref, shallowRef, computed, InjectionKey } from 'vue-demi';

export type FormBlocoControl = {
	formBlocoEditando: Ref<unknown>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FORM_BLOCO_CONTROL_KEY: InjectionKey<FormBlocoControl> = 'form-bloco-control' as any;

export function provideFormBlocoControl(): FormBlocoControl {
	const formBlocoEditando = shallowRef(null);
	provide(FORM_BLOCO_CONTROL_KEY, {
		formBlocoEditando,
	});
	return { formBlocoEditando };
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function useFormBlocoControl() {
	const formBlocoKey = Object.freeze({});
	const formBlocoControl = inject(FORM_BLOCO_CONTROL_KEY, null);
	const formBlocoEditando = ref(false);
	const formBlocoEditar = (editando: boolean) => {
		if (editando) {
			formBlocoEditando.value = true;
			if (formBlocoControl) formBlocoControl.formBlocoEditando.value = formBlocoKey;
		} else {
			formBlocoEditando.value = false;
			if (formBlocoControl) formBlocoControl.formBlocoEditando.value = false;
		}
	};
	return {
		formBlocoKey,
		formBlocoEditando,
		formBlocoControlDisabled: computed(() => {
			if (!formBlocoControl) return false;
			return (
				formBlocoControl.formBlocoEditando.value &&
				formBlocoControl.formBlocoEditando.value !== formBlocoKey
			);
		}),
		formBlocoEditar,
	};
}
