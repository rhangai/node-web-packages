# @rhangai/nuxt-matomo

## Install

```sh
yarn add @rhangai/nuxt-matomo
```

## Configuration

```js
module.exports = {
	buildModules: ['@rhangai/nuxt-matomo'],
	publicRuntimeConfig: {
		matomo: {
			url: '//my-matomo.site/',
			siteId: '1',
			trackerUrl: 'some-matomo-custom-tracker', // Optional. Ex: //my-matomo.site/piwik.php
			scriptUrl: 'some-matomo-custom-script', // Optional. Ex: //my-matomo.site/piwik.js
		},
	},
};
```
