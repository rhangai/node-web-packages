```sh
yarn add --dev @rhangai/eslint-config-vue-typescript \
  @typescript-eslint/eslint-plugin@^5.59 \
  eslint@^8 \
  eslint-plugin-import@^2.27 \
  eslint-plugin-prettier@^4.2 \
  eslint-plugin-vue@^7.11.0 \
  prettier@^2 \
```

```js
module.exports = {
	root: true,
	extends: ['@rhangai/vue-typescript'],
	parserOptions: {
		tsconfigRootDir: __dirname,
		project: './tsconfig.json',
	},
};
```
