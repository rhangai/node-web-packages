<template lang="pug">
mask-field(
	:value='dateView',
	:label='label',
	:readonly='inputReadonly || readonly',
	:rules='dateRules',
	@input='dateViewSet',
	mask='date',
	validate-on-blur,
	v-bind='$attrs')
	template(#append)
		v-menu(
			v-if='!formState.disabled && !formState.readonly',
			v-model='datePopup',
			:close-on-content-click='false',
			bottom,
			left,
			min-width='290px',
			offset-y)
			template(#activator='activator')
				v-icon(v-bind='activator.attrs', v-on='activator.on') mdi-calendar
			v-date-picker(
				:value='dateModel',
				:disabled='disabled',
				:readonly='readonly',
				@input='dateOnSelect',
				no-title,
				scrollable,
				v-bind='datePickerProps')
</template>
<script lang="ts">
import { defineComponent, ref, watch, shallowRef, computed } from 'vue-demi';
import { FormStateProps, provideFormState } from '@rhangai/vue-form-composition';
import { dateParse, DateParseOptions, DateType } from '@rhangai/web-common';
import MaskField from './mask-field.vue';

export default defineComponent({
	inheritAttrs: false,
	components: {
		MaskField,
	},
	props: {
		...FormStateProps,
		value: { type: String, default: '' },
		label: { type: String, required: false, default: 'Data' },
		rules: { type: Array, default: () => [] },
		disabled: { type: Boolean, default: null },
		readonly: { type: Boolean, default: null },
		inputReadonly: { type: Boolean, default: false },
		datePickerProps: { type: Object, default: () => ({}) },
		modelFormat: { type: String, default: 'YYYY-MM-DD' },
		viewFormat: { type: String, default: 'DD/MM/YYYY' },
	},
	setup(props, { emit }) {
		const { formState } = provideFormState(props);
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const dateTryParse = (value: any, options: DateParseOptions) => {
			try {
				return dateParse(value, options);
			} catch (err) {
				return null;
			}
		};

		const datePopup = ref(false);
		const dateObject = shallowRef<DateType | null>(null);
		const dateView = ref('');
		const dateModel = ref<string | null>();
		const dateViewSet = (v: string) => {
			const d = dateTryParse(v, { inputFormat: props.viewFormat });
			dateView.value = v;
			if (!d || d.format(props.viewFormat) !== v) {
				dateObject.value = null;
				dateModel.value = null;
			} else {
				dateObject.value = d;
				dateModel.value = d.format(props.modelFormat);
			}
			emit('input', dateModel.value);
		};
		const dateModelSet = (v: unknown) => {
			if (v === dateModel.value) return;
			const d = dateTryParse(v, { inputFormat: props.modelFormat });
			dateObject.value = d;
			if (d) {
				dateView.value = d.format(props.viewFormat);
			}
		};
		watch(() => props.value, dateModelSet, { immediate: true });

		const dateRuleInvalid = (viewValue: string) => {
			if (viewValue && !dateModel.value) return `Data inválida`;
			return true;
		};

		const dateRules = computed(() => {
			const viewValue: string = dateView.value;
			return [dateRuleInvalid, ...props.rules].map((rule) => {
				if (typeof rule === 'function') {
					return rule(viewValue);
				}
				return rule;
			});
		});

		const dateOnSelect = (date: unknown) => {
			dateModelSet(date);
			datePopup.value = false;
		};
		return {
			formState,
			dateRules,
			datePopup,
			dateModel,
			dateView,
			dateViewSet,
			dateOnSelect,
		};
	},
});
</script>
