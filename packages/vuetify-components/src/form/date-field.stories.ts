import { defineStoryComponentModel, defineStoryMeta } from '@@story/helper';
import DateField from './date-field.vue';

export default defineStoryMeta({
	title: 'ui/form/DateField',
	component: DateField,
});

export const Story = defineStoryComponentModel({
	component: DateField,
	exampleValue: () => '2020-10-10',
});
