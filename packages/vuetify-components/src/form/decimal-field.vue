<template lang="pug">
app-text-field(
	:value='decimalView',
	@input='decimalOnInput',
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
import { useDecimalField } from '@rhangai/vuetify-util';
import { omit } from 'ramda';
import { provideVuetifyFieldRef } from './vuetify-field';

export default defineComponent({
	inheritAttrs: false,
	props: {
		decimalPlaces: {
			type: Number,
			default: 2,
		},
		value: {
			type: String,
			default: '',
		},
	},
	setup(props, { emit, listeners }) {
		const { decimalRef, decimalView, decimalOnInput } = useDecimalField({
			value: () => props.value,
			onInput: (value) => emit('input', value),
			decimalPlaces: () => props.decimalPlaces,
		});
		provideVuetifyFieldRef(decimalRef);
		return {
			decimalRef,
			decimalView,
			decimalOnInput,
			eventListeners: omit(['input'], listeners),
		};
	},
});
</script>
