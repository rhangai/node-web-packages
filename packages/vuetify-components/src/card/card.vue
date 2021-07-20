<template lang="pug">
v-card.app-card(
	:class='{ "app-card--padding": !semPadding }',
	flat,
	tile)
	.app-card__inner: slot
</template>
<script lang="ts">
import { defineComponent } from '@vue/composition-api';

export default defineComponent({
	props: {
		semPadding: {
			type: Boolean,
			default: false,
		},
	},
});
</script>

<style lang="scss" scoped>
.app-card.app-card--padding {
	padding: 1em;
}
</style>
