import { watch } from '@vue/composition-api';
import { FormStatePropsType } from './state';
import { useForm, UseFormOptions, UseFormResult } from './use-form';

export type UseFormModelOptions<T extends Record<string, unknown>> = Omit<UseFormOptions<T>, 'onValue' | 'props'> & {
	props: FormStatePropsType & { value?: unknown };
	emit: (event: 'input', value: unknown) => void;
};

export function useFormModel<T extends Record<string, unknown>>(options: UseFormModelOptions<T>): UseFormResult<T> {
	const { emit, ...useFormOptions } = options;
	const formBindings = useForm<T>({
		...useFormOptions,
		onValue(v) {
			emit('input', v);
		},
	});
	watch(() => options.props.value, formBindings.formSet, { immediate: true });
	return formBindings;
}
