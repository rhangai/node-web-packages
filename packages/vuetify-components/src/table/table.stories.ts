import { defineStoryComponent, defineStoryMeta } from '@@story/helper';
import AppTableAction from './table-action.vue';
import AppTable from './table.vue';

export default defineStoryMeta({
	title: 'ui/AppTable',
	component: AppTable,
	subcomponents: { AppTableAction },
});

export const Table = defineStoryComponent({
	component: AppTable,
	mixins: [
		{
			components: { AppTableAction },
			data: () => ({
				tableHeaders: [
					{
						text: 'Id',
						value: 'id',
						width: 48,
					},
					{
						text: 'Nome',
						value: 'nome',
						width: 240,
					},
					{
						text: 'Empresa',
						value: 'empresa',
					},
				],
				tableItems: [...generate()],
			}),
		},
	],
	template: `
		<story-component-raw :headers="tableHeaders" :items="tableItems" :actions="3" v-bind="args">
			<template #actions="{ item }">
				<app-table-action icon="mdi-home" />
				<app-table-action icon="mdi-home" />
				<app-table-action icon="mdi-home" />
			</template>
		</story-component-raw>
	`,
});

function generate() {
	const items = [];
	for (let i = 0; i <= 35; ++i) {
		items.push({
			id: i,
			nome: 'Renan',
			empresa: 'Honest Tecnologia',
		});
	}
	items.push({
		id: 100,
		nome: "Lorem Ipsum is simply dummy text of the printing and typesettingtypesettingtypesettingtypesettingtypesettingtypesettingtypesettingtypesettingtypesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s",
		empresa: 'Renan',
	});
	return items;
}
