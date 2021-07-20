import type { Context } from '@nuxt/types';
import { AuthRequestService, AuthResponseStatus } from './auth-request-service';
import type { AuthModuleOptions, AuthModuleRefreshOptions } from './options';

export class AuthModule {
	private auth: AuthRequestService;

	private storeNamespace: string;

	constructor(private readonly options: AuthModuleOptions) {
		this.storeNamespace = this.options.storeNamespace ?? 'auth';
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

	async refresh<User = unknown, Data = unknown>(
		options: AuthModuleRefreshOptions<User, Data>
	): Promise<void> {
		const payload: Partial<{ user: User; data: Data }> = {};

		const getUser = async (authPayload: any): Promise<User> => {
			const defaultUser = {
				id: authPayload.sub,
				email: authPayload.email,
				nome: authPayload.name,
			};
			const user = await options.fetchUser?.(authPayload);
			return { ...defaultUser, ...user } as any;
		};

		const { authStatus, error, data } = await this.auth.refresh(async (authPayload: any) => {
			const user = await getUser(authPayload);
			this.options.context.store.commit(`${this.storeNamespace}/user`, user);
		});
		if (authStatus === AuthResponseStatus.UNAUTHORIZED) {
			await this.onRouteUnauthorized(options.route);
			return;
		}
		if (error) {
			throw error;
		}
		const user = await getUser(data);
		payload.user = user;
		payload.data = await options.fetchData?.(user);
		if (options.validate) {
			const isValid = await options.validate(payload as Required<typeof payload>);
			if (isValid === false) {
				return;
			}
		}
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
