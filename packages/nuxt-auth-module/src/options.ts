import type { Context } from '@nuxt/types';
import type { AxiosRequestConfig } from 'axios';

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

export type AuthModuleRefreshOptions<User, Data> = {
	route: Context['route'];
	fetchUser?(payload: any): Promise<User> | User;
	fetchData?(user: User): Promise<Data> | Data;
	validate?(payload: { user: User; data: Data }): Promise<boolean> | boolean;
};
