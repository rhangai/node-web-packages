/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Plugin } from '@nuxt/types';

type NuxtMatomoConfig = {
	url: string;
	siteId: string;
	enabled?: boolean;
	scriptUrl?: string;
	trackerUrl?: string;
};

class NuxtMatomo {
	private matomo: any = null;

	private paq: any[] | null = null;

	private enabled = false;

	constructor(private readonly config: NuxtMatomoConfig) {
		if (this.config?.url && this.config?.enabled !== false) {
			this.enabled = true;
		}
		this.injectScriptInternal();
	}

	private injectScriptInternal() {
		if (!this.enabled) return;
		const d = document;
		const g = d.createElement('script');
		const s = d.getElementsByTagName('script')[0];
		g.async = true;
		g.src = this.config.scriptUrl ?? `${this.config.url}matomo.js`;
		s?.parentNode ? s.parentNode.insertBefore(g, s) : d.body.appendChild(g);
	}

	send(command: string, ...args: any[]) {
		if (!this.enabled) return;
		if (!this.matomo) {
			const globalMatomo = (window as any).Matomo;
			if (globalMatomo) {
				const trackerUrl = this.config.trackerUrl ?? `${this.config.url}matomo.php`;
				this.matomo = globalMatomo.getAsyncTracker(trackerUrl, this.config.siteId);
				this.matomo.setTrackerUrl(trackerUrl);
				this.matomo.setSiteId(this.config.siteId);
			}
		}
		if (!this.matomo && !this.paq) {
			const trackerUrl = this.config.trackerUrl ?? `${this.config.url}matomo.php`;
			// eslint-disable-next-line no-underscore-dangle, no-multi-assign
			const paq: any[] = ((window as any)._paq = (window as any)._paq || []);
			this.paq = paq;
			this.paq.push(['setTrackerUrl', trackerUrl]);
			this.paq.push(['setSiteId', this.config.siteId]);
		}
		if (this.matomo) {
			this.matomo[command](...args);
		} else if (this.paq) {
			this.paq.push([command, ...args]);
		}
	}

	trackPageView() {
		this.send('trackPageView');
	}
}

export default <Plugin>function nuxtMatomoPlugin({ app, $config }, inject) {
	const nuxtMatomo = new NuxtMatomo($config.matomo);
	const { router } = app;
	if (router) {
		router.afterEach((to, from) => {
			const url = resolveRoute(router, to);
			nuxtMatomo.send('setCustomUrl', url);
			const fromUrl = resolveRoute(router, from);
			nuxtMatomo.send('setReferrerUrl', fromUrl);
			nuxtMatomo.trackPageView();
		});
	}
	inject('matomo', nuxtMatomo);
};

function resolveRoute(router: any, route: any) {
	if (!route) return null;
	const newParams: Record<string, string> = {};
	// eslint-disable-next-line guard-for-in
	for (const paramKey in route.params) {
		newParams[paramKey] = `:${paramKey}`;
	}
	return router.resolve({ ...route, params: newParams }).href;
}
