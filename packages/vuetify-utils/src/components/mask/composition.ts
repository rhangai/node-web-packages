import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from '@vue/composition-api';
import { equals } from 'ramda';
import { useMaskManager } from './mask-manager';

export type UseMaskOptions = {
	value: () => string;
	mask: () => any;
	maskOptions?: () => any;
	onInput: (value: string) => void;
};

export function useMask(options: UseMaskOptions) {
	const { maskManager } = useMaskManager();

	let imaskInstance: any;

	const maskElement = ref<Vue | HTMLElement | null>(null);
	const maskValue = ref<string>('');

	/**
	 * Pega o elemento de input dessa máscara
	 */
	const getInputElement = (): HTMLInputElement | null => {
		const elValue = maskElement.value;
		if (!elValue) return null;

		const el = '$el' in elValue ? elValue.$el : elValue;
		if (el.tagName === 'INPUT') {
			return el as HTMLInputElement;
		}
		const child = el.getElementsByTagName('input');
		return child[0] ?? null;
	};

	const imaskOptions = computed(() => maskManager.imaskOptions(options.mask(), options.maskOptions?.()));

	const imaskSetup = () => {
		if (imaskInstance) {
			imaskInstance.destroy();
			imaskInstance = null;
		}

		const imask = maskManager.imaskCreate(getInputElement(), imaskOptions.value);
		if (!imask) return;

		const oldImaskUpdateControl = imask.updateControl;
		imask.updateControl = function updateControl() {
			oldImaskUpdateControl.apply(this);
			const maskComponent = maskElement.value as any;

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

		imask.on('accept', () => {
			const { value } = imask;
			maskValue.value = value;
			options.onInput(value);
		});

		// Reseta a máscara
		imask.value = '';
		const value = options.value();
		if (value != null) {
			imask.value = `${value}`;
		}

		//
		const maskComponent = maskElement.value as any;
		if ('hasInput' in maskComponent) {
			nextTick(() => {
				maskComponent.hasInput = false;
			});
		}

		imaskInstance = imask;
	};

	const maskRefresh = (value: string) => {
		if (!imaskInstance) return;
		imaskInstance.value = value;
		imaskInstance.updateValue();
	};

	watch(
		() => imaskOptions.value,
		(newOptions, oldOptions) => {
			if (equals(newOptions, oldOptions)) return;
			if (imaskInstance) {
				imaskInstance.updateOptions(newOptions ?? { mask: /./ });
			}
		}
	);

	watch(
		() => options.value(),
		(value) => {
			if (imaskInstance && value !== maskValue.value) {
				imaskInstance.value = `${value}`;
			}
		}
	);

	onMounted(() => {
		imaskSetup();
	});

	onBeforeUnmount(() => {
		if (imaskInstance) {
			imaskInstance.destroy();
			imaskInstance = null;
		}
	});

	return {
		maskValue,
		maskElement,
		maskRefresh,
	};
}
