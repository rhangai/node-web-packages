import type { VueConstructor } from 'vue';
import { MaskManager, VuetifyMasksOptions } from './components/mask/mask-manager';

type VuetifyMaskFieldPluginOptions = {
	component?: boolean | string;
	masks: VuetifyMasksOptions;
};

export const VuetifyMaskFieldPlugin = {
	install(vue: VueConstructor, options: VuetifyMaskFieldPluginOptions) {
		const mask = MaskManager.create(options.masks);
		Object.defineProperty(vue.prototype, '$vuetifyUtilsOptions', {
			value: mask,
		});

		if (options.component !== false) {
			const componentName = typeof options.component === 'string' ? options.component : 'v-mask-field';
			vue.component(componentName);
		}
	},
};
