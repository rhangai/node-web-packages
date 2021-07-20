import { InjectionKey, provide, Ref, ref, inject } from 'vue-demi';

const VUETIFY_FIELD_REF_KEY: InjectionKey<Ref<any>> = 'honest(vuetify-field)' as any;

export function provideVuetifyFieldRef(fieldRef: Ref<any>) {
	provide(VUETIFY_FIELD_REF_KEY, fieldRef);
}

export function useVuetifyFieldRef() {
	let fieldRef = inject(VUETIFY_FIELD_REF_KEY, null);
	if (!fieldRef) {
		fieldRef = ref();
	}
	return fieldRef;
}
