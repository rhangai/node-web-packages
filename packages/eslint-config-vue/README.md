```sh
yarn add --dev eslint \
  prettier \
  eslint-plugin-prettier \
  eslint-plugin-vue \
  @typescript-eslint/eslint-plugin \
  @typescript-eslint/parser \
  @vue/eslint-config-airbnb \
  @vue/eslint-config-prettier \
  @vue/eslint-config-typescript
```

```js
module.exports = {
	extends: [
		'plugin:vue/essential',
		'@vue/airbnb',
		'@vue/typescript/recommended',
		'@vue/prettier',
		'@vue/prettier/@typescript-eslint',
	],
};
```
