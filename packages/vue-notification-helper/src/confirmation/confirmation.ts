import { injectConfirmationHandler, ConfirmationHandler } from './confirmation-handler';

export type UseConfirmationHelperResult<TConfirmation> = {
	confirm: ConfirmationHandler<TConfirmation>;
};

/**
 * Get the confirmation helper
 */
export function useConfirmationHelper<TConfirmation>(): UseConfirmationHelperResult<TConfirmation> {
	const ctx = injectConfirmationHandler();
	if (!ctx) throw new Error(`provideConfirmationHandler not called`);
	return {
		confirm: ctx.confirmationHandler,
	};
}
