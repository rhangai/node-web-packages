<template lang="pug">
app-text-field(
	:value='maskValue',
	v-bind='$attrs',
	v-on='eventListeners')
	template(:slot='name', v-for='(_, name) in $slots')
		slot(:name='name')
	template(
		:slot='name',
		slot-scope='scope',
		v-for='(_, name) in $scopedSlots')
		slot(:name='name', v-bind='scope')
</template>
<script lang="ts">
import { defineComponent } from 'vue-demi';
import { useMaskField } from '@rhangai/vuetify-util';
import { omit } from 'ramda';
import { provideVuetifyFieldRef } from './vuetify-field';

const MASKS: Record<string, unknown> = {
	cep: { mask: '00000-000' },
	cpf: { mask: '000.000.000-00' },
	cnpj: { mask: '00.000.000/0000-00' },
	date: { mask: '00/00/0000' },
	horario: { mask: '00:00' },
	cpfcnpj: {
		mask: [{ mask: '000.000.000-00' }, { mask: '00.000.000/0000-00' }],
		prepare: (v: string) => v.replace(/\D/g, ''),
	},
	telefone: {
		mask: [{ mask: '(00) 0000-0000' }, { mask: '(00) 00000-0000' }],
		prepare: (v: string) => v.replace(/\D/g, ''),
	},
};

export default defineComponent({
	inheritAttrs: false,
	props: {
		mask: {
			type: String,
			default: 'cpf',
		},
		value: {
			type: String,
			default: '',
		},
	},
	setup(props, { emit, listeners }) {
		const { maskRef, maskValue } = useMaskField({
			value: () => props.value,
			mask: () => MASKS[props.mask],
			onInput: (v) => emit('input', v),
		});
		provideVuetifyFieldRef(maskRef);
		return {
			maskValue,
			eventListeners: omit(['input'], listeners),
		};
	},
});
</script>
