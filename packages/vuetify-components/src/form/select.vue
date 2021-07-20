<template lang="pug">
v-select(
	:disabled='formState.disabled',
	:readonly='formState.readonly',
	:rules='formRules',
	persistent-placeholder,
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
import { computed, defineComponent } from 'vue-demi';
import { FormStateProps, provideFormState } from '@rhangai/vue-form-composition';

export default defineComponent({
	inheritAttrs: false,
	props: {
		...FormStateProps,
		rules: {
			type: Array,
			default: () => [],
		},
	},
	setup(props) {
		const { formState } = provideFormState(props);
		const formRules = computed(() => {
			if (!formState.shouldValidate) return [];
			return props.rules;
		});
		return {
			formRules,
			formState,
		};
	},
});
</script>
