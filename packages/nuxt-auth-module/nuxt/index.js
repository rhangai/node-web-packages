import { resolve } from 'path';

export default function pjNuxtModule(moduleOptions) {
	this.addPlugin({
		src: resolve(__dirname, 'plugin.template.js'),
		options: {
			interval: moduleOptions?.interval ?? 2 * 60000,
			authRequestConfig: JSON.stringify({
				baseURL: '/',
				url: 'auth/refresh',
				...moduleOptions?.authRequestConfig,
			}),
			authRoutes: JSON.stringify(normalizeRoutes(moduleOptions.authRoutes)),
		},
	});
}

function normalizeRoutes(routes) {
	if (!routes) return [];
	if (!Array.isArray(routes))
		throw new Error(`Configuração inválida de rotas. Deve ser uma array`);
	routes = routes.flatMap(normalizeRoute);
	return routes.reverse();
}

function normalizeRoute(route) {
	if (route == null) return null;
	if (typeof route === 'string') {
		return { path: route };
	} else if (typeof route === 'object') {
		let mode = 0;
		mode += route.path != null ? 1 : 0;
		mode += route.pathPrefix != null ? 1 : 0;
		if (mode !== 1) {
			throw new Error(`Você tem que indicar apenas um path ou pathPrefix.`);
		}
		if (route.path != null) {
			if (typeof route.path !== 'string') throw new Error(`routes.path deve ser string.`);
			return { path: route.path, public: route.public };
		} else if (route.pathPrefix != null) {
			if (typeof route.pathPrefix !== 'string')
				throw new Error(`routes.pathPrefix deve ser string.`);
			return { pathPrefix: route.pathPrefix, public: route.public };
		} else if (route.pathRegex != null) {
			if (typeof route.pathRegex !== 'string')
				throw new Error(`routes.pathRegex deve ser string.`);
			return { pathRegex: route.pathRegex, public: route.public };
		}
	}
	throw new Error(`Configuração inválida`);
}
