import { ref, watch, ComputedRef, computed, isRef } from '@vue/composition-api';
import { Decimal, DecimalInput, decimalParse } from '@rhangai/web-common';
import { useTextFieldModelView } from './util/text-model-view';
import { useTextFieldSyncCursor } from './util/text-sync';

type Option<T> = T | (() => T) | ComputedRef<T>;
export type UseDecimalFieldOptions = {
	value?: Option<unknown>;
	decimalPlaces?: Option<number>;
	decimalViewOptions?: Option<any>;
	onInput?: (value: string | null) => void;
};

export function useDecimalField(options: UseDecimalFieldOptions) {
	const decimalPlaces = optionToRef(options.decimalPlaces, 2);
	const decimalViewOptions = optionToRef(options.decimalViewOptions, {});

	const decimalRef = ref();
	const decimalTryParse = (value: DecimalInput) => {
		try {
			return decimalParse(value);
		} catch {
			return null;
		}
	};
	const { textModelSet: decimalModelSet, textView: decimalView } = useTextFieldModelView<Decimal>({
		modelParse(v: unknown) {
			if (typeof v === 'string' || typeof v === 'number') return decimalTryParse(v);
			else if (Decimal.isBigNumber(v)) return v;
			return null;
		},
		modelFormat(v) {
			return v.toFixed(decimalPlaces.value);
		},
		viewParse(v) {
			const view = v.replace(/\D/g, '');
			if (!view) return null;
			const decimal = decimalTryParse(view);
			if (!decimal) return null;
			return decimal.shiftedBy(-decimalPlaces.value);
		},
		viewFormat(v) {
			return v.toFormat(decimalPlaces.value, {
				decimalSeparator: ',',
				groupSeparator: '.',
				groupSize: 3,
				...decimalViewOptions.value,
			});
		},
		onValue(value, modelValue) {
			options.onInput?.(modelValue);
		},
	});
	const { textFieldOnInput: decimalOnInput } = useTextFieldSyncCursor(decimalRef, decimalView);
	if (options.value) watch(optionToRef(options.value), decimalModelSet);

	return {
		decimalRef,
		decimalView,
		decimalOnInput,
	};
}

function optionToRef<T>(value: Option<T>): ComputedRef<T>;
function optionToRef<T>(value: Option<T> | undefined | null, defaultValue: T): ComputedRef<T>;
function optionToRef<T>(value: Option<T>, defaultValue?: unknown): ComputedRef<unknown> {
	if (typeof value === 'function') return computed(value as any);
	else if (isRef(value)) return value;
	else if (value != null) return computed(() => value);
	return computed(() => defaultValue ?? null);
}