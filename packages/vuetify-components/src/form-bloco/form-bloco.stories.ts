import { defineComponent } from 'vue-demi';
import { defineStoryComponent, defineStoryMeta } from '@@story/helper';
import { required } from '@@web/validator';
import AppFormBloco from './form-bloco.vue';

export default defineStoryMeta({
	title: 'ui/form-bloco/FormBloco',
	component: AppFormBloco,
});

export const Story = defineStoryComponent({
	component: AppFormBloco,
	mixins: [
		defineComponent({
			components: {
				AppFormBloco,
			},
			data: () => ({
				storyForm: { nome: '' },
				storyFormRules: { nome: [required('Campo obrigatório')] },
			}),
			methods: {
				async storySubmit() {
					console.log('Teste');
					await new Promise((resolve) => setTimeout(resolve, 2000));
				},
			},
		}),
	],
	template: `
		<div>
			<app-form-bloco :is-edicao="!!args.isEdicao" v-model="storyForm" :submit="storySubmit" :readonly="!!args.readonly" :label="args.label || ''">
				<app-text-field v-model="storyForm.nome" :rules="storyFormRules.nome" />
			</app-form-bloco>
			<pre>{{storyForm}}</pre>
		</div>
	`,
});
