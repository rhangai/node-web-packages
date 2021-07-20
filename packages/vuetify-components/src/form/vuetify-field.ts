import { InjectionKey, provide, Ref, ref, inject } from 'vue-demi';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const VUETIFY_FIELD_REF_KEY: InjectionKey<Ref<unknown>> = 'honest(vuetify-field)' as any;

export function provideVuetifyFieldRef(fieldRef: Ref<unknown>): void {
	provide(VUETIFY_FIELD_REF_KEY, fieldRef);
}

export function useVuetifyFieldRef(): Ref<unknown> {
	let fieldRef = inject(VUETIFY_FIELD_REF_KEY, null);
	if (!fieldRef) {
		fieldRef = ref();
	}
	return fieldRef;
}
