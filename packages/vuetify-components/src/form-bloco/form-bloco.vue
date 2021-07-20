<template lang="pug">
v-form(ref='formRef', @submit.prevent)
	.form-bloco__header(v-if='label || $slots.label || (isEdicao && !blocoReadonly)')
		.form-bloco__header-title-wrapper
			slot(name='label')
				h2.form-bloco__header-title.primary--text.text-subtitle-1.font-weight-bold {{ label }}
		template(v-if='isEdicao && !blocoReadonly')
			.form-bloco__header-actions(cols='12', sm='auto')
				template(v-if='formBlocoEditando')
					v-btn.mr-2.form-bloco__action-button(
						:disabled='formState.disabled || formSubmitting',
						@click='edicaoCancelar',
						color='#222',
						depressed,
						text,
						x-small) Cancelar #[v-icon.ml-2(small) mdi-cancel]
					v-btn.form-bloco__action-button(
						:disabled='formState.disabled || edicaoValorInalterado',
						:loading='formSubmitting || loading',
						@click='edicaoSalvar',
						color='primary',
						depressed,
						type='submit',
						x-small) Salvar #[v-icon.ml-2(small) mdi-content-save]
				template(v-else)
					v-btn.form-bloco__action-button(
						:disabled='formState.disabled',
						@click='edicaoEditar',
						color='primary',
						outlined,
						text,
						x-small) {{ editarLabel }} #[v-icon.ml-2(small) mdi-pencil]

	slot
	template(v-if='!isEdicao && !blocoReadonly')
		v-row
			v-spacer
			v-col(cols='auto')
				v-btn(
					:disabled='formState.disabled',
					:loading='formSubmitting || loading',
					@click='formSubmit',
					color='primary')
					slot(name='cadastrar') Cadastrar
</template>
<script lang="ts">
import { defineComponent, ref, computed } from 'vue-demi';
import { provideFormState, useFormState } from '@rhangai/vue-form-composition';
import { equals } from 'ramda';
import { useFormBlocoControl } from './form-bloco-control';

export default defineComponent({
	props: {
		isEdicao: {
			type: Boolean,
			default: false,
		},
		editarLabel: {
			type: String,
			default: 'Editar',
		},
		submit: {
			type: Function,
			required: true,
		},
		value: {
			type: Object,
			default: null,
		},
		label: {
			type: String,
			default: null,
		},
		loading: {
			type: Boolean,
			default: false,
		},
		readonly: {
			type: Boolean,
			default: null,
		},
		disabled: {
			type: Boolean,
			default: null,
		},
		shouldValidate: {
			type: Boolean,
			default: null,
		},
	},
	setup(props, { emit }) {
		const formRef = ref();
		const formSubmitting = ref(false);
		const formSubmit = async () => {
			if (formSubmitting.value) return;
			formSubmitting.value = true;
			try {
				if (formRef.value?.validate() === false) return;
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				await (props as any).submit?.();
			} finally {
				formSubmitting.value = false;
			}
		};

		const { formBlocoControlDisabled, formBlocoEditando, formBlocoEditar } =
			useFormBlocoControl();

		const { formState: formStateParent } = useFormState();
		const blocoReadonly = computed(() => {
			return props.readonly ?? formStateParent.readonly;
		});

		const { formState } = provideFormState({
			shouldValidate: computed(() => {
				if (props.shouldValidate != null) return props.shouldValidate;
				if (props.readonly || props.disabled) return false;
				if (props.isEdicao && !formBlocoEditando.value) return false;
				return true;
			}),
			disabled: computed(() => {
				if (formBlocoControlDisabled.value) return true;
				return formSubmitting.value || props.disabled;
			}),
			readonly: computed(() => {
				if (props.readonly) return true;
				if (props.isEdicao) return !formBlocoEditando.value;
				return props.readonly;
			}),
		});

		const edicaoSetup = () => {
			const edicaoValorSalvo = ref();
			const edicaoEditar = () => {
				if (formBlocoEditando.value) return;
				formRef.value?.resetValidation();
				formBlocoEditar(true);
				edicaoValorSalvo.value = JSON.parse(JSON.stringify(props.value));
				emit('update:editando', true);
			};
			const edicaoCancelar = () => {
				if (!formBlocoEditando.value) return;
				formRef.value?.resetValidation();
				formBlocoEditar(false);
				emit('update:editando', false);
				emit('input', edicaoValorSalvo.value);
			};
			const edicaoSalvar = async () => {
				if (!formBlocoEditando.value) return;
				await formSubmit();
				formBlocoEditar(false);
				emit('update:editando', false);
			};
			const edicaoValorInalterado = computed(() => {
				return equals(props.value, edicaoValorSalvo.value);
			});
			return {
				formBlocoEditando,
				edicaoEditar,
				edicaoCancelar,
				edicaoSalvar,
				edicaoValorInalterado,
			};
		};
		return {
			blocoReadonly,
			formRef,
			formState,
			formSubmit,
			formSubmitting,
			...edicaoSetup(),
		};
	},
});
</script>
<style lang="scss" scoped>
.form-bloco__action-button {
	padding-top: 11px !important;
	padding-bottom: 11px !important;
}

.form-bloco__header {
	display: flex;
	flex-wrap: nowrap;
	margin-bottom: 4px;
}

.form-bloco__header-title-wrapper {
	flex: 1 1 0;
	overflow: hidden;
}

.form-bloco__header-title {
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}

.form-bloco__header-actions {
	flex: 0 0 auto;
	padding-left: 8px;
}
</style>
