import { defineStoryComponentModel, defineStoryMeta } from '@@story/helper';
import MaskField from './mask-field.vue';

export default defineStoryMeta({
	title: 'ui/form/MaskField',
	component: MaskField,
	argTypes: {
		value: {
			control: 'text',
		},
	},
});

export const Story = defineStoryComponentModel({
	component: MaskField,
	exampleValue: () => '100000',
});
