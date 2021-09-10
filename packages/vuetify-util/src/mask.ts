/* eslint-disable @typescript-eslint/no-explicit-any */
import { computed, ref, unref, watch } from '@vue/composition-api';
import IMask, { AnyMaskedOptions } from 'imask';

export type MaskOptions = AnyMaskedOptions;

export type UseMaskOptions = {
	value?: () => string;
	mask?: () => AnyMaskedOptions;
	onInput?: (value: string) => void;
};

/**
 * Transform a single value using the mask
 * @param input
 * @param mask
 * @returns The masked string
 */
export function maskTransform(input: string, mask: AnyMaskedOptions): string {
	return IMask.pipe(input, mask);
}

export function useMaskField(options: UseMaskOptions) {
	const maskValue = ref('');
	const maskRef = ref();

	const valueParam = computed(() => {
		if (!options.value) return '';
		return options.value();
	});

	const maskInputElement = computed<HTMLInputElement | null>(() => {
		const maskRefValue = unref(maskRef);
		if (!maskRefValue) return null;
		const el = '$el' in maskRefValue ? maskRefValue.$el : maskRefValue;
		if (el.tagName === 'INPUT') {
			return el as HTMLInputElement;
		}
		const child = el.getElementsByTagName('input');
		return child[0] ?? null;
	});

	const maskIMaskOptions = computed<AnyMaskedOptions>(() => options.mask?.() ?? { mask: /./ });

	let imaskInstance: IMask.InputMask<any> | null = null;
	const maskSetup = (element: HTMLInputElement, maskOptions: any) => {
		const imask = IMask(element, maskOptions);
		maskVuetifyPatch(imask, maskRef.value);
		imask.on('accept', () => {
			const { value } = imask;
			maskValue.value = value;
			options.onInput?.(value);
		});
		imask.value = '';
		if (valueParam.value) {
			imask.value = `${valueParam.value}`;
		}

		imaskInstance = imask;
	};

	const maskDestroy = () => {
		if (imaskInstance) {
			imaskInstance.destroy();
			imaskInstance = null;
		}
	};

	watch(maskInputElement, (element) => {
		if (!element) return null;
		maskSetup(element, maskIMaskOptions.value);
		return () => {
			maskDestroy();
		};
	});

	watch(maskIMaskOptions, (maskOptions) => {
		if (imaskInstance) {
			imaskInstance.updateOptions(maskOptions);
		}
	});

	watch(valueParam, (value) => {
		if (imaskInstance) {
			if (value !== maskValue.value) {
				imaskInstance.value = '';
				imaskInstance.value = `${value}`;
			}
			imaskInstance.updateValue();
		}
	});
	return {
		maskRef,
		maskValue,
	};
}

function maskVuetifyPatch(imaskParam: IMask.InputMask<any>, maskComponentParam: any) {
	const imask: IMask.InputMask<any> & {
		// eslint-disable-next-line camelcase
		$$__updateControl?: IMask.InputMask<any>['updateControl'];
	} = imaskParam;
	const maskComponent = maskComponentParam;
	const oldImaskUpdateControl = imask.$$__updateControl || imask.updateControl;
	imask.$$__updateControl = oldImaskUpdateControl;
	imask.updateControl = function updateControl() {
		oldImaskUpdateControl.apply(this);
		const vuetifyProps: string[] = ['lazyValue', 'lazySearch'];
		vuetifyProps.forEach((prop) => {
			if (prop in maskComponent) {
				maskComponent[prop] = this.value;
			}
			if (maskComponent.$children[0] && prop in maskComponent.$children[0]) {
				maskComponent.$children[0][prop] = this.value;
			}
		});
	};
}
