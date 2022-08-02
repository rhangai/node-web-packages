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
	} as PropOptions<boolean | null | undefined>,
	disabled: {
		type: Boolean,
		default: null,
	} as PropOptions<boolean | null | undefined>,
	shouldValidate: {
		type: Boolean,
		default: null,
	} as PropOptions<boolean | null | undefined>,
	forceReadonly: {
		type: Boolean,
		default: null,
	} as PropOptions<boolean | null | undefined>,
	forceDisabled: {
		type: Boolean,
		default: null,
	} as PropOptions<boolean | null | undefined>,
};
