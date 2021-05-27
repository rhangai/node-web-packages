export type FormControlPropsType = {
	readonly?: boolean | null;
	disabled?: boolean | null;
	shouldValidate?: boolean | null;
};

export const FormControlProps = {
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
};
