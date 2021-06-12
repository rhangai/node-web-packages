```sh
yarn add --dev @rhangai/eslint-config-vue-typescript \
  eslint \
  prettier \
  eslint-config-airbnb-base \
  eslint-config-prettier \
  eslint-import-resolver-typescript \
  eslint-plugin-import \
  eslint-plugin-prettier \
  eslint-plugin-vue \
  @rhangai/eslint-config-typescript \
  @typescript-eslint/eslint-plugin \
  @typescript-eslint/parser \
  @vue/eslint-config-prettier \
  @vue/eslint-config-typescript
```

```js
module.exports = {
	root: true,
	extends: ['@rhangai/vue-typescript'],
};
```
