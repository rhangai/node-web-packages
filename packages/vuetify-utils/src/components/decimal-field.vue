<template lang="pug">
app-text-field(v-if='isReadonlyEmpty', readonly, v-bind='formFieldAttrs', v-on='listeners')
v-text-field.app-form-field(
	v-else,
	ref='textFieldRef',
	:value='decimalView',
	@input='onInput',
	v-bind='formFieldAttrs',
	v-on='listeners'
)
	slot(v-for='(_, name) in $slots', :name='name', :slot='name')
	template(v-for='(_, name) in $scopedSlots', :slot='name', slot-scope='scope')
		slot(:name='name', v-bind='scope')
</template>
<script lang="ts">
import { Decimal, decimalParse, decimalFormat, decimalFormatToLocal } from '@rhangai/web-common';
import { defineComponent, ref, watch, computed, shallowRef, markRaw } from '@vue/composition-api';
import { omit } from 'ramda';
import './form-field.scss';

export default defineComponent({
	inheritAttrs: false,
	props: {
		value: { type: [String, Object], default: null },
		digitos: { type: Number, default: 2 },
		max: { type: [Number, String], default: 1000000000 },
		negativo: { type: Boolean, default: true },
		porcentagem: { type: Boolean, default: false },
		returnObject: { type: Boolean, default: false },
	},
	setup(props, { emit, attrs, listeners }) {
		const { textFieldRef, textFieldInput, textFieldSetCursor } = useTextField();
		const { decimalView, decimalModel, decimalModelSet, decimalViewSet } = useDecimalField(props);

		const isReadonlyEmpty = computed(() => {
			if (formControl.readonly && !props.value) return true;
			return false;
		});
		const onInput = (v: string) => {
			decimalViewSet(v);
			const input = textFieldInput.value;
			if (input) {
				let positionFromEnd = input.value.length - (input.selectionEnd ?? 0);
				const decimalViewValue = decimalView.value;
				input.value = decimalViewValue;
				positionFromEnd = Math.max(positionFromEnd, 0);
				positionFromEnd = decimalViewValue.length - positionFromEnd;
				textFieldSetCursor(positionFromEnd);
				textFieldRef.value.lazyValue = decimalViewValue;
			}
		};
		watch(() => props.value, decimalModelSet, { immediate: true });
		watch(decimalModel, (v) => emit('input', v), { immediate: true });

		return {
			textFieldRef,
			decimalView,
			isReadonlyEmpty,
			onInput,
			listeners: omit(['input'], listeners),
		};
	},
});

type DecimalProps = {
	returnObject: boolean;
	porcentagem: boolean;
	digitos: number;
	negativo: boolean;
	max: string | number;
};

function useDecimalField(props: DecimalProps) {
	const decimal = shallowRef<Decimal | null>(null);

	// Valor decimal máximo de acordo com as props
	const decimalMax = computed(() => {
		const max = decimalParse(props.max) ?? new Decimal(1000000000);
		return markRaw(max);
	});

	// Normaliza o valor decimal
	const decimalNormalize = (decimalParam: Decimal | null) => {
		let decimalValue = decimalParam;
		if (!decimalValue) return null;
		if (!decimalValue.isFinite()) return null;
		if (decimalValue.isNegative() && !props.negativo) {
			decimalValue = decimalValue.negated();
		}
		const max = decimalMax.value;
		if (decimalValue.gt(max)) {
			return false;
		} else if (props.negativo) {
			const min = max.negated();
			if (decimalValue.lte(min)) {
				return false;
			}
		} else if (decimalValue.lt(0)) {
			return false;
		}
		return markRaw(decimalValue);
	};

	// Seta um valor decimal puro
	const decimalSet = (decimalParam: Decimal | null) => {
		const decimalNewValue = decimalNormalize(decimalParam);
		if (decimalNewValue !== false) {
			decimal.value = decimalNewValue;
		}
	};

	// Valor do modelo
	const decimalModel = computed(() => {
		if (props.returnObject) return decimal.value;
		if (!decimal.value) return '';
		const decimalString = decimalFormat(decimal.value, props.digitos + (props.porcentagem ? 2 : 0));
		return decimalString;
	});

	// Seta o valor do decimal a partir do model
	const decimalModelSet = (v: string | null) => {
		if (!v) {
			if (!decimalModel.value) return;
			decimalSet(null);
		} else if (decimalModel.value !== v) {
			decimalSet(decimalParse(v));
		}
	};

	// Valor do decimal a ser mostrado na tela
	const decimalView = computed(() => {
		let decimalValue = decimal.value;
		if (!decimalValue) return '';
		if (props.porcentagem) {
			decimalValue = decimalValue.multipliedBy(100);
		}
		return decimalFormatToLocal(decimalValue, props.digitos) ?? '';
	});

	// Seta o valor do decimal a partir da tela
	const decimalViewSet = (v: string | null) => {
		if (!v) {
			decimalSet(null);
			return;
		}
		let valueRaw = v.trim();
		const isNegative = valueRaw.indexOf('-') >= 0;
		valueRaw = v.replace(/[^\d]+/g, '');

		if (!valueRaw) {
			valueRaw = '0';
		} else if (valueRaw.length <= props.digitos) {
			valueRaw = `0.${valueRaw.padStart(props.digitos, '0')}`;
		} else if (props.digitos > 0) {
			const decimalPosition = valueRaw.length - props.digitos;
			const valueIntegerPart = valueRaw.substr(0, decimalPosition);
			const valueDecimalPart = valueRaw.substr(decimalPosition);
			valueRaw = `${valueIntegerPart}.${valueDecimalPart}`;
		}
		let decimalValue = decimalParse(valueRaw);
		if (!decimalValue) {
			decimalSet(null);
			return;
		}
		if (isNegative) {
			decimalValue = decimalValue.negated();
		}
		if (props.porcentagem) {
			decimalValue = decimalValue.dividedBy(100);
		}
		decimalSet(decimalValue);
	};

	return {
		decimalModel,
		decimalModelSet,
		decimalView,
		decimalViewSet,
	};
}

/**
 * Funções de manipulação direta dos componentes do vuetify
 */
function useTextField() {
	const textFieldRef = ref();
	const textFieldInputGet = (): HTMLInputElement | null => {
		const component = textFieldRef.value;
		if (!component) return null;
		const element: HTMLElement = component.$el ?? component;
		if (element.tagName === 'INPUT') {
			return element as HTMLInputElement;
		}
		const inputElements = element.getElementsByTagName('input');
		return inputElements[0] ?? null;
	};
	const textFieldInput = computed(textFieldInputGet);

	const textFieldSetCursor = (position: number) => {
		const el = textFieldInput.value;
		if (!el) return;
		const setSelectionRange = () => {
			el.setSelectionRange(position, position);
		};
		if (el === document.activeElement) {
			setSelectionRange();
			setTimeout(setSelectionRange, 1); // Android Fix
		}
	};
	return {
		textFieldRef,
		textFieldInput,
		textFieldSetCursor,
	};
}
</script>
