<template lang="pug">
v-text-field(
	ref='fieldRef',
	:disabled='formState.disabled',
	:readonly='formState.readonly',
	:rules='formRules',
	persistent-placeholder,
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
import { computed, defineComponent } from 'vue-demi';
import { FormStateProps, provideFormState } from '@rhangai/vue-form-composition';
import { useVuetifyFieldRef } from './vuetify-field';

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
		const fieldRef = useVuetifyFieldRef();
		const { formState } = provideFormState(props);
		const formRules = computed(() => {
			if (!formState.shouldValidate) return [];
			return props.rules;
		});
		return {
			fieldRef,
			formState,
			formRules,
		};
	},
});
</script>
