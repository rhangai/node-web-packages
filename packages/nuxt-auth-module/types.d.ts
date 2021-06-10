import type { AuthModule } from './lib/auth-module';

declare module '@nuxt/types' {
	interface Context {
		$auth: AuthModule;
	}
}
