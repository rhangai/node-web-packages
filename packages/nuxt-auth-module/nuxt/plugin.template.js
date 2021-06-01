import { PjCoreModule } from '@packages/pj-nuxt-module/src/core';

export default function pjNuxtModulePlugin(context, inject) {
	const core = new PjCoreModule({
		interval: <%= options.interval %>,
		context: context,
		authRequestConfig: JSON.parse('<%= options.authRequestConfig %>'),
		authRoutes: JSON.parse('<%= options.authRoutes %>'),
	});
	context.$core = core;
}
