<template lang="pug">
v-data-table.app-table(
	:class='{ "app-table--striped": stripped, "app-table--has-pointer": rowClickable }',
	:dense='dense',
	:disable-sort='!sortable',
	:footer-props='footerProps',
	:headers='tableHeaders',
	v-bind='$attrs',
	v-on='$listeners')
	template(#item.actions='item')
		.app-table__actions
			slot(name='actions', v-bind='item')
	template(:slot='name', v-for='(_, name) in $slots')
		slot(:name='name')
	template(
		:slot='name',
		slot-scope='scope',
		v-for='(_, name) in $scopedSlots')
		slot(:name='name', v-bind='scope')
</template>
<script lang="ts">
import { computed, defineComponent } from 'vue-demi';
import { definePropType } from '@@web/lib/util';
import { provideTableContext } from './table-context';

export default defineComponent({
	inheritAttrs: false,
	props: {
		dense: {
			type: Boolean,
			default: false,
		},
		sortable: {
			type: Boolean,
			default: false,
		},
		stripped: {
			type: Boolean,
			default: false,
		},
		rowClickable: {
			type: Boolean,
			default: false,
		},
		headers: {
			type: definePropType<any[]>(Array),
			default: [],
		},
		actions: {
			type: Number,
			default: null,
		},
	},
	setup(props) {
		const footerProps = { 'items-per-page-options': [15, 20, 50] };
		const tableHeaders = computed(() => {
			let headers = props.headers ?? [];
			if (props.actions) {
				headers = headers.concat({
					text: 'Ações',
					value: 'actions',
					sortable: false,
					width: props.actions * 36,
					align: 'center',
				});
			}
			return headers;
		});

		provideTableContext(() => ({
			dense: props.dense,
		}));

		return {
			tableHeaders,
			footerProps,
		};
	},
});
</script>
<style lang="scss" scoped>
.app-table {
	table-layout: fixed;
	background: transparent !important;

	&::v-deep table {
		thead tr th {
			color: $primary !important;
		}
	}

	&#{&}--has-pointer::v-deep tr {
		cursor: pointer;
	}

	&#{&}--striped::v-deep {
		tbody tr:nth-of-type(even) {
			background-color: rgba(#eee, 0.5);
		}
	}

	& &__actions {
		display: inline-flex;
	}
}
</style>
