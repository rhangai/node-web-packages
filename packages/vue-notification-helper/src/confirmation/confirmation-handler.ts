import { provide, inject, InjectionKey } from 'vue-demi';

const CONFIRMATION_HANDLER_SYMBOL: InjectionKey<ConfirmationHandlerContext<unknown>> = Symbol(
	'@rhangai/vue-notification-helper/confirmation-handler'
);

export type ConfirmationHandler<TConfirmation> = (confirmation: TConfirmation) => Promise<boolean>;

export type ConfirmationHandlerContext<TConfirmation> = {
	confirmationHandler: ConfirmationHandler<TConfirmation>;
};

/**
 * Create the confirmation ref handler
 */
export function injectConfirmationHandler<
	TConfirmation
>(): ConfirmationHandlerContext<TConfirmation> | null {
	return inject(CONFIRMATION_HANDLER_SYMBOL, null);
}

/**
 * Create the confirmation ref handler
 */
export function provideConfirmationHandler<TConfirmation>(
	confirmationHandler: ConfirmationHandler<TConfirmation>
): void {
	//
	provide(CONFIRMATION_HANDLER_SYMBOL, { confirmationHandler });
}
