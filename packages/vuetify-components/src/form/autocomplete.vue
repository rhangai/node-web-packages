<template lang="pug">
v-autocomplete(
	:disabled='formStateDisabled',
	:persistent-placeholder='!!placeholder',
	:placeholder='placeholder',
	:readonly='formStateReadonly',
	:rules='formRules',
	v-bind='$attrs',
	v-on='$listeners')
	template(:slot='slotName', v-for='(_, slotName) in $slots') 
		slot(:name='slotName')
	template(
		:slot='slotName',
		slot-scope='props',
		v-for='(_, slotName) in $scopedSlots') 
		slot(:name='slotName', v-bind='props')
</template>
<script lang="ts">
import { computed, defineComponent, unref } from 'vue-demi';
import { FormStateProps, provideFormState } from '@rhangai/vue-form-composition';

export default defineComponent({
	inheritAttrs: false,
	props: {
		...FormStateProps,
		placeholder: {
			type: String,
			default: '',
		},
		rules: {
			type: Array,
			default: () => [],
		},
	},
	setup(props) {
		const { formStateDisabled, formStateReadonly, formStateShouldValidate } =
			provideFormState(props);
		const formRules = computed(() => {
			if (!unref(formStateShouldValidate)) return undefined;
			return props.rules;
		});
		return {
			formStateDisabled,
			formStateReadonly,
			formStateShouldValidate,
			formRules,
		};
	},
});
</script>
