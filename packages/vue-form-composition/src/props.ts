import { FormControlProps } from './control/form-control-props';

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
