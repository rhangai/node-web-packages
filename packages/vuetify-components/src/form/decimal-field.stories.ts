import { defineStoryComponentModel, defineStoryMeta } from '@@story/helper';
import DecimalField from './decimal-field.vue';

export default defineStoryMeta({
	title: 'ui/form/DecimalField',
	component: DecimalField,
});

export const Story = defineStoryComponentModel({
	component: DecimalField,
	exampleValue: () => '120.32',
});
