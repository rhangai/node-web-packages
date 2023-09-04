const config = require('./index');

module.exports = {
	...config,
	extends: [
		'plugin:eslint-plugin-vue/vue3-strongly-recommended',
		'@rhangai/typescript',
		'@vue/eslint-config-typescript/recommended',
	],
};
