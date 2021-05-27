import { FormControlProps } from './control/form-control-props';

export const FormProps = {
	...FormControlProps,
	value: {
		type: Object,
		default: null,
	},
};
