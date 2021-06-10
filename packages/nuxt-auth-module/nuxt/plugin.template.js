import { AuthModule } from '@rhangai/nuxt-auth-module';

export default function authNuxtModulePlugin(context, inject) {
	const auth = new AuthModule({
		interval: <%= options.interval %>,
		context: context,
		authRequestConfig: JSON.parse('<%= options.authRequestConfig %>'),
		authRoutes: JSON.parse('<%= options.authRoutes %>'),
	});
	context.$auth = auth;
}
