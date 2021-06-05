import { computed, ref, unref, watch } from '@vue/composition-api';
import IMask from 'imask';

export type UseMaskOptions = {
	value?: () => string;
	mask?: () => unknown;
	onInput?: (value: string) => void;
};

export function useMaskField(options: UseMaskOptions) {
	const maskValue = ref('');
	const maskRef = ref();

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

	const maskIMaskOptions = computed<any>(() => options.mask?.() ?? { mask: /./ });

	let imaskInstance: IMask.InputMask<any> | null = null;
	const maskSetup = (element: HTMLInputElement, maskOptions: any) => {
		const imask = IMask(element, maskOptions);
		maskVuetifyPatch(imask, maskRef.value);
		imask.on('accept', () => {
			const { value } = imask;
			maskValue.value = value;
			options.onInput?.(value);
		});
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

	if (options.value) {
		watch(options.value, (value) => {
			if (imaskInstance) {
				if (value !== maskValue.value) {
					imaskInstance.value = '';
					imaskInstance.value = `${value}`;
				}
				imaskInstance.updateValue();
			}
		});
	}
	return {
		maskRef,
		maskValue,
	};
}

function maskVuetifyPatch(imaskParam: IMask.InputMask<any>, maskComponentParam: any) {
	const imask = imaskParam;
	const maskComponent = maskComponentParam;
	const oldImaskUpdateControl = imask.updateControl;
	imask.updateControl = function updateControl() {
		oldImaskUpdateControl.apply(this);
		const vuetifyProps: string[] = ['lazyValue', 'lazySearch'];
		// @ts-ignore
		vuetifyProps.forEach((prop) => {
			if (prop in maskComponent) {
				maskComponent[prop] = this.value;
			}
			if (prop in maskComponent.$children[0]) {
				maskComponent.$children[0][prop] = this.value;
			}
		});
	};
}