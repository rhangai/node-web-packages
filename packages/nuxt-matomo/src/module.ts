import { resolve } from 'path';
import type { Module } from '@nuxt/types';

export default <Module>function nuxtMatomoModule() {
	this.addPlugin({
		src: resolve(__dirname, 'plugin.js'),
		fileName: 'matomo/plugin.js',
		ssr: false,
	});
};
