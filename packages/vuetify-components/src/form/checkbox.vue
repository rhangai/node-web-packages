<template lang="pug">
v-checkbox(
	:disabled='formState.disabled',
	:readonly='formState.readonly',
	v-bind='$attrs',
	v-on='$listeners')
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
import { FormStateProps, provideFormState } from '@rhangai/vue-form-composition';

export default defineComponent({
	inheritAttrs: false,
	model: {
		prop: 'inputValue',
		event: 'change',
	},
	props: {
		...FormStateProps,
	},
	setup(props) {
		const { formState } = provideFormState(props);
		return {
			formState,
		};
	},
});
</script>
