<template lang="pug">
v-btn(
	:icon='!!icon',
	:small='tableContext.dense',
	text,
	v-bind='$attrs',
	v-on='$listeners')
	slot
		template(v-if='icon')
			v-icon(:small='tableContext.dense') {{ icon }}
</template>
<script lang="ts">
import { defineComponent } from 'vue-demi';
import { useTableContext } from './table-context';

export default defineComponent({
	inheritAttrs: false,
	props: {
		icon: {
			type: String,
			default: null,
		},
	},
	setup() {
		const { tableContext } = useTableContext();
		return {
			tableContext,
		};
	},
});
</script>
