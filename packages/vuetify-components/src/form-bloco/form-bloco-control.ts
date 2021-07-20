import { inject, provide, Ref, ref, shallowRef, ComputedRef, computed } from 'vue-demi';
import { defineInjectionKey } from '@@web/lib/util';

export type FormBlocoControl = {
	formBlocoEditando: Ref<unknown>;
};

const FORM_BLOCO_CONTROL_KEY = defineInjectionKey<FormBlocoControl>('form-bloco-control');

export function provideFormBlocoControl() {
	const formBlocoEditando = shallowRef(null);
	provide(FORM_BLOCO_CONTROL_KEY, {
		formBlocoEditando,
	});
	return { formBlocoEditando };
}

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
		formBlocoEditando: formBlocoEditando as ComputedRef<boolean>,
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
