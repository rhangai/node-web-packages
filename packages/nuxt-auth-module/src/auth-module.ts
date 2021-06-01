import type { Context } from '@nuxt/types';
import { AuthRequestService, AuthResponseStatus } from './auth-request-service';
import type { AuthModuleOptions, AuthModuleRefreshOptions } from './options';

export class AuthModule {
	private auth: AuthRequestService;

	private storeNamespace: string;

	constructor(private readonly options: AuthModuleOptions) {
		this.storeNamespace = this.options.storeNamespace ?? 'core';
		this.auth = new AuthRequestService({
			interval: options.interval,
			authRequestConfig: options.authRequestConfig,
			onLogout: () => {
				// eslint-disable-next-line @typescript-eslint/no-floating-promises
				this.onLogout();
			},
			onError(err) {
				// eslint-disable-next-line no-console
				console.error(err);
			},
		});
	}

	async refresh<User = unknown>(options: AuthModuleRefreshOptions<User>): Promise<void> {
		const payload: Record<string, unknown> = {};

		const getUsuario = async (authPayload: any): Promise<User> => {
			const defaultUsuario = {
				id: authPayload.sub,
				email: authPayload.email,
				nome: authPayload.name,
			};
			const usuario = await options.fetchUser?.(authPayload);
			return { ...defaultUsuario, ...usuario } as any;
		};

		const { authStatus, error, data } = await this.auth.refresh(async (authPayload: any) => {
			const usuario = await getUsuario(authPayload);
			this.options.context.store.commit(`${this.storeNamespace}/usuario`, usuario);
		});
		if (authStatus === AuthResponseStatus.UNAUTHORIZED) {
			await this.onRouteUnauthorized(options.route);
			return;
		}
		if (error) {
			throw error;
		}
		const usuario = await getUsuario(data);
		payload.usuario = usuario;
		payload.data = await options.fetchData?.(usuario);
		this.options.context.store.commit(`${this.storeNamespace}/set`, payload);
	}

	private async onRouteUnauthorized(currentRoute: Context['route']): Promise<void> {
		const isPublic = this.isRoutePublic(currentRoute);
		if (!isPublic) {
			await this.onLogout(currentRoute.fullPath);
		}
	}

	private isRoutePublic(currentRoute: Context['route']): boolean {
		const { path } = currentRoute;
		if (this.options.authRoutes.length <= 0) return false;
		for (const route of this.options.authRoutes) {
			if (route.path != null && route.path === path) {
				return !!route.public;
			} else if (route.pathRegex != null) {
				const regex = new RegExp(route.pathRegex);
				if (regex.test(path)) {
					return !!route.public;
				}
			} else if (route.pathPrefix != null) {
				if (path === route.pathPrefix || path.startsWith(`${route.pathPrefix}/`)) {
					return !!route.public;
				}
			}
		}
		return true;
	}

	private async onLogout(newRoute?: string): Promise<never> {
		return new Promise<never>(() => {
			if (newRoute) {
				window.location.href = newRoute;
			} else {
				window.location.reload();
			}
		});
	}
}
