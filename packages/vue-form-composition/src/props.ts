import { PropOptions } from 'vue-demi';
import { FormStateProps } from './state/form-state-props';

export const FormProps = {
	...FormStateProps,
};

export const FormModelProps = {
	...FormStateProps,
	value: {
		type: Object,
		default: null,
	} as PropOptions<unknown>,
};
