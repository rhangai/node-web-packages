<template lang="pug">
v-textarea(
	:disabled='formState.disabled',
	:readonly='formState.readonly',
	persistent-placeholder,
	v-bind='$attrs',
	v-on='$listeners')
</template>
<script lang="ts">
import { defineComponent } from 'vue-demi';
import { FormStateProps, provideFormState } from '@rhangai/vue-form-composition';

export default defineComponent({
	inheritAttrs: false,
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
