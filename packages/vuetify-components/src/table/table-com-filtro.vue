<template lang="pug">
.app-table-com-filtro
	v-row.mb-2
		v-col.order-sm-last(
			v-if='$slots["filtro-action"] || $scopedSlots["filtro-action"]',
			cols='12',
			sm='auto',
			md='auto',
			lg='auto')
			slot(name='filtro-action')
		v-col
			app-text-field(
				v-model='tableSearch',
				append-icon='mdi-magnify',
				dense,
				hide-details,
				label='Filtrar',
				outlined,
				placeholder='Digite para buscar')
	app-table(
		:search='tableSearch',
		v-bind='$attrs',
		v-on='$listeners')
		slot(
			:name='name',
			:slot='name',
			v-for='(_, name) in $slots')
		template(
			:slot='name',
			slot-scope='scope',
			v-for='(_, name) in $scopedSlots')
			slot(:name='name', v-bind='scope')
</template>
<script lang="ts">
import { defineComponent, ref } from 'vue-demi';

export default defineComponent({
	inheritAttrs: false,
	setup() {
		const tableSearch = ref('');
		return {
			tableSearch,
		};
	},
});
</script>
