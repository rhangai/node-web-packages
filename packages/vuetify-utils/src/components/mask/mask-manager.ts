import { getCurrentInstance } from '@vue/composition-api';
import IMask from 'imask';

type VuetifyMasksMap = Record<string, unknown>;

export type VuetifyMasksOptions = VuetifyMasksMap | (() => VuetifyMasksMap);

/**
 * Mask provider
 */
export class MaskManager {
	constructor(private readonly masks: VuetifyMasksMap) {}

	// Pega as opções da máscara
	imaskOptions(
		mask: string | Record<string, any> | null,
		maskOptions?: Record<string, any> | null
	): Record<string, any> | null {
		if (!mask) return null;
		if (typeof mask === 'string') {
			let IMaskOptions: any = this.masks[mask];
			if (!IMaskOptions) return null;
			if (typeof IMaskOptions === 'function') {
				IMaskOptions = IMaskOptions(maskOptions);
			}
			return { ...IMaskOptions };
		}
		return mask;
	}

	// Cria uma máscara para um elemento HTML
	imaskCreate(
		input: HTMLElement | null,
		mask: string | Record<string, any> | null,
		maskOptions?: Record<string, any> | null
	): IMask.InputMask<any> | null {
		if (!input) return null;
		const IMaskOptions = this.imaskOptions(mask, maskOptions);
		return IMask(input, (IMaskOptions as any) || { mask: /./ });
	}

	// Create a mask manager
	static create(masksOptions: VuetifyMasksOptions): MaskManager {
		const masks = typeof masksOptions === 'function' ? masksOptions() : masksOptions;
		return new MaskManager({ ...masks });
	}
}
export function useMaskManager() {
	const vm = getCurrentInstance()!;

	const maskManager: MaskManager = (vm.proxy as any).$vuetifyMask;
	return { maskManager };
}
