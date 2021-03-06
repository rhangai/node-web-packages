import { computed, shallowRef } from 'vue-demi';

export type UseTextFieldModelViewOptions<T> = {
	modelParse(modelValue: unknown): T | null;
	modelFormat(value: T): string;
	viewParse(viewValue: string): T | null;
	viewFormat(value: T): string;
	transformValue?(value: T): T | null;
	onValue?(value: T | null, modelValue: string | null, viewValue: string): void;
};

export function useTextFieldModelView<T>(options: UseTextFieldModelViewOptions<T>) {
	const textValue = shallowRef<T | null>(null);

	const setValue = (valueParam: T | null) => {
		let value = valueParam;
		if (value != null && options.transformValue) {
			value = options.transformValue(value);
		}
		textValue.value = value;
		// eslint-disable-next-line @typescript-eslint/no-use-before-define
		options.onValue?.(value, textModel.value, textView.value);
	};

	const textModel = computed({
		get() {
			if (!textValue.value) return null;
			return options.modelFormat(textValue.value);
		},
		set(modelValue: string | null) {
			if (!modelValue) setValue(null);
			else setValue(options.modelParse(modelValue));
		},
	});

	const textView = computed<string>({
		get() {
			if (!textValue.value) return '';
			return options.viewFormat(textValue.value);
		},
		set(viewValue: string) {
			if (!viewValue) setValue(null);
			else setValue(options.viewParse(viewValue));
		},
	});

	return {
		textValue,
		textModel,
		textModelSet(v: unknown) {
			textModel.value = v as any;
		},
		textView,
	};
}
