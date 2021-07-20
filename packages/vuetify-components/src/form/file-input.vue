<template lang="pug">
v-file-input(
	:disabled='formState.disabled',
	:readonly='formState.readonly',
	:rules='formRules',
	append-icon='mdi-paperclip',
	persistent-placeholder,
	prepend-icon='',
	show-size,
	validate-on-blur,
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

export default defineComponent({
	inheritAttrs: false,
	model: {
		prop: 'value',
		event: 'change',
	},
	props: {
		...FormStateProps,
		rules: {
			type: Array,
			default: () => [],
		},
		placeholder: {
			type: String,
			default: 'Selecione um arquivo',
		},
	},
	setup(props) {
		const { formState } = provideFormState(props);
		const formRules = computed(() => {
			if (!formState.shouldValidate) return [];
			return props.rules;
		});
		return {
			formState,
			formRules,
		};
	},
});
</script>
