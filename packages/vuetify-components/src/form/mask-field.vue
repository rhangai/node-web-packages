<template lang="pug">
text-field(
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
import { MASKS } from './masks';
import TextField from './text-field.vue';
import { provideVuetifyFieldRef } from './vuetify-field';

export default defineComponent({
	inheritAttrs: false,
	components: {
		TextField,
	},
	props: {
		mask: {
			type: String,
			default: null,
		},
		value: {
			type: String,
			default: '',
		},
	},
	setup(props, { emit, listeners }) {
		const { maskRef, maskValue } = useMaskField({
			value: () => props.value,
			mask: () => MASKS.value[props.mask],
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
