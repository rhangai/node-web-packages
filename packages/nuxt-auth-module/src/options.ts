import type { AxiosRequestConfig } from 'axios';
import type { Context } from '@nuxt/types';

export type AuthModuleOptionsRoute = {
	path?: string;
	pathPrefix?: string;
	pathRegex?: string;
	public?: boolean;
};

export type AuthModuleOptions = {
	context: Context;
	storeNamespace?: string;
	interval: number;
	authRequestConfig: AxiosRequestConfig;
	authRoutes: AuthModuleOptionsRoute[];
};

export type AuthModuleRefreshOptions<User> = {
	route: Context['route'];
	fetchUser?(payload: any): Promise<User> | User;
	fetchData?(user: User): Promise<unknown> | unknown;
};
