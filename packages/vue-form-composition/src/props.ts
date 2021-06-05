import { FormControlProps } from './state/form-state-props';

export const FormProps = {
	...FormControlProps,
};

export const FormModelProps = {
	...FormControlProps,
	value: {
		type: Object,
		default: null,
	},
};
