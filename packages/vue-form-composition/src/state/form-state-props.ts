import { PropOptions } from 'vue-demi';

export type FormStatePropsType = {
	readonly readonly?: boolean | null;
	readonly disabled?: boolean | null;
	readonly shouldValidate?: boolean | null;
	readonly forceReadonly?: boolean | null;
	readonly forceDisabled?: boolean | null;
};

export const FormStateProps = {
	readonly: {
		type: Boolean,
		default: null,
	},
	disabled: {
		type: Boolean,
		default: null,
	},
	shouldValidate: {
		type: Boolean,
		default: null,
	},
	forceReadonly: {
		type: Boolean,
		default: null,
	},
	forceDisabled: {
		type: Boolean,
		default: null,
	},
};
