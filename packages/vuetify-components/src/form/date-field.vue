<template lang="pug">
mask-field(
	:value='dateView',
	:label='label',
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
				:allowed-dates='allowedDates',
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
		datePickerProps: { type: Object, default: () => ({}) },
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
			const d = dateTryParse(v, { inputFormat: 'DD/MM/YYYY' });
			dateView.value = v;
			if (!d || d.format('DD/MM/YYYY') !== v) {
				dateObject.value = null;
				dateModel.value = null;
			} else {
				dateObject.value = d;
				dateModel.value = d.format('YYYY-MM-DD');
			}
			emit('input', dateModel.value);
		};
		const dateModelSet = (v: unknown) => {
			if (v === dateModel.value) return;
			const d = dateTryParse(v, { inputFormat: 'YYYY-MM-DD' });
			dateObject.value = d;
			if (d) {
				dateView.value = d.format('DD/MM/YYYY');
			}
		};
		watch(() => props.value, dateModelSet, { immediate: true });

		const dataInvalidRule = () => {
			if (dateView.value && !dateModel.value) return `Data inválida`;
			return true;
		};

		const dateRules = computed(() => {
			return [dataInvalidRule, ...props.rules];
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
