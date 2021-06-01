import { watch } from '@vue/composition-api';
import { useForm, UseFormOptions, UseFormResult } from './use-form';

export type UseFormModelOptions<T> = Omit<UseFormOptions<T>, 'onValue'> & {
	emit: (event: 'input', value: T) => void;
};

export function useFormModel<T extends {}>(options: UseFormModelOptions<T>): UseFormResult<T> {
	const { emit, ...useFormOptions } = options;
	const formBindings = useForm({
		...useFormOptions,
		onValue(v) {
			emit('input', v);
		},
	});
	watch(() => options.props.value, formBindings.formSet, { immediate: true });
	return formBindings;
}
