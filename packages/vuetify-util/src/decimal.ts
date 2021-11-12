import { ref, watch, ComputedRef, computed, Ref, isRef } from '@vue/composition-api';
import { Decimal, DecimalInput, decimalParse } from '@rhangai/web-common';
import type BigNumber from 'bignumber.js';
import { useTextFieldModelView } from './util/text-model-view';
import { useTextFieldSyncCursor } from './util/text-sync';

type Option<T> = T | (() => T) | ComputedRef<T>;
export type UseDecimalFieldOptions = {
	value?: Option<unknown>;
	min?: Option<number | string | null | undefined>;
	max?: Option<number | string | null | undefined>;
	shiftBy?: Option<number>;
	decimalPlaces?: Option<number>;
	decimalViewOptions?: Option<BigNumber.Format>;
	onInput?: (value: string | null) => void;
};

export type UseDecimalFieldResult = {
	decimalRef: Ref<unknown>;
	decimalView: Ref<string>;
	decimalOnInput(viewValue: string): void;
};

export function useDecimalField(options: UseDecimalFieldOptions): UseDecimalFieldResult {
	const shiftBy = optionToRef(options.shiftBy, 0);
	const decimalPlaces = optionToRef(options.decimalPlaces, 2);
	const decimalViewOptions = optionToRef(options.decimalViewOptions, {});

	const min = computed(() => {
		const minValue = optionUnref(options.min);
		if (minValue == null) return null;
		return new Decimal(minValue);
	});
	const max = computed(() => {
		const maxValue = optionUnref(options.max);
		if (maxValue == null) return null;
		return new Decimal(maxValue);
	});

	const decimalRef = ref();
	const decimalTryParse = (value: DecimalInput) => {
		try {
			return decimalParse(value);
		} catch {
			return null;
		}
	};
	const { textModelSet: decimalModelSet, textView: decimalView } = useTextFieldModelView<Decimal>(
		{
			modelParse(v: unknown) {
				let modelValue: BigNumber | null = null;
				if (typeof v === 'string' || typeof v === 'number') modelValue = decimalTryParse(v);
				else if (Decimal.isBigNumber(v)) modelValue = v;
				return modelValue;
			},
			modelFormat(v) {
				return v.toFixed(decimalPlaces.value + shiftBy.value);
			},
			viewParse(v) {
				const view = v.replace(/\D/g, '');
				if (!view) return null;
				const decimal = decimalTryParse(view);
				if (!decimal) return null;
				return decimal.shiftedBy(-decimalPlaces.value - shiftBy.value);
			},
			viewFormat(v) {
				return v.shiftedBy(shiftBy.value).toFormat(decimalPlaces.value, {
					decimalSeparator: ',',
					groupSeparator: '.',
					groupSize: 3,
					...decimalViewOptions.value,
				});
			},
			transformValue(valueParam) {
				let value = valueParam;
				if (min.value && value.isLessThan(min.value)) value = min.value;
				if (max.value && value.isGreaterThan(max.value)) value = max.value;
				return value;
			},
			onValue(value, modelValue) {
				options.onInput?.(modelValue);
			},
		}
	);
	const { textFieldOnInput: decimalOnInput } = useTextFieldSyncCursor(decimalRef, decimalView);
	if (options.value) watch(optionToRef(options.value), decimalModelSet, { immediate: true });

	return {
		decimalRef,
		decimalView,
		decimalOnInput,
	};
}

function optionUnref<T>(value: Option<T>): T;
function optionUnref<T>(value: Option<T | null | undefined> | null | undefined): T | null {
	if (typeof value === 'function') return (value as any)() ?? null;
	else if (isRef(value)) return value.value ?? null;
	return value ?? null;
}

function optionToRef<T>(value: Option<T>): ComputedRef<T>;
function optionToRef<T>(value: Option<T> | undefined | null, defaultValue: T): ComputedRef<T>;
function optionToRef<T>(value: Option<T>, defaultValue?: unknown): ComputedRef<unknown> {
	if (isRef(value)) return value;
	return computed(() => optionUnref(value) ?? defaultValue ?? null);
}
