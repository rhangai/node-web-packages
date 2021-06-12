export type ConfirmationHandler<TConfirmation> = (confirmation: TConfirmation) => boolean | Promise<boolean>;

export type CreateUseConfirmationOptions<TConfirmation> = {
	confirm: ConfirmationHandler<TConfirmation>;
};

export type CreateUseConfirmationResult<TConfirmation> = {
	useConfirmation: () => { confirm: ConfirmationHandler<TConfirmation> };
};

export function createUseConfirmation<TConfirmation>(
	options: CreateUseConfirmationOptions<TConfirmation>
): CreateUseConfirmationResult<TConfirmation> {
	const useConfirmation = () => ({ confirm: options.confirm });
	return { useConfirmation };
}
