export type FormStatePropsType = {
	readonly readonly?: boolean | null;
	readonly disabled?: boolean | null;
	readonly shouldValidate?: boolean | null;
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
};
