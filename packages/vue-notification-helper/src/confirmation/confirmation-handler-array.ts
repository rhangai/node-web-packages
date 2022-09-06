import { ref, Ref, reactive, nextTick, UnwrapRef, InjectionKey, inject, provide } from 'vue-demi';
import { TIMEOUT_DELAY } from '../constants';
import { provideConfirmationHandler } from './confirmation-handler';

const CONFIRMATION_ARRAY_KEY: InjectionKey<Ref<ConfirmationHandlerArrayItem<unknown>[]>> = Symbol(
	'@rhangai/vue-notification-helper/confirmation-handler-array'
);

/**
 * Type for the confirmation handler
 */
export type ConfirmationHandlerArrayItem<TConfirmation> = {
	id: number;
	confirmation: UnwrapRef<TConfirmation>;
	active: boolean;
	resolve: (value: boolean) => void;
	/// Shortcut for confirmation.resolve(true);
	confirm: () => void;
	/// Shortcut for confirmation.resolve(false);
	reject: () => void;
};

/**
 * Type for the result of array of confirmations
 */
export type ProvideConfirmationHandlerArrayResult<TConfirmation> = {
	confirmations: Readonly<
		Ref<ReadonlyArray<Readonly<ConfirmationHandlerArrayItem<TConfirmation>>>>
	>;
};

/**
 * Provide a confirmation handler using an array of items
 */
export function provideConfirmationHandlerArray<
	TConfirmation
>(): ProvideConfirmationHandlerArrayResult<TConfirmation> {
	let confirmationIdCounter = 0;
	const confirmations: Ref<ConfirmationHandlerArrayItem<TConfirmation>[]> = ref([]);
	const confirm = (confirmation: TConfirmation) => {
		const confirmationId = confirmationIdCounter;
		confirmationIdCounter += 1;
		return new Promise<boolean>((resolve) => {
			let resolved = false;
			const confirmationItem = reactive({
				id: confirmationId,
				confirmation,
				active: false,
				resolve(value: boolean) {
					if (resolved) return;
					resolved = true;
					resolve(value);
					confirmationItem.active = false;
					setTimeout(() => {
						const index = confirmations.value.findIndex((n) => n.id === confirmationId);
						if (index >= 0) {
							confirmations.value.splice(index, 1);
						}
					}, TIMEOUT_DELAY);
				},
				confirm() {
					confirmationItem.resolve(true);
				},
				reject() {
					confirmationItem.resolve(false);
				},
			});
			confirmations.value.push(confirmationItem);
			nextTick(() => {
				confirmationItem.active = true;
			});
		});
	};
	provideConfirmationHandler<TConfirmation>(confirm);
	provide(CONFIRMATION_ARRAY_KEY, confirmations);
	return {
		confirmations,
	};
}

/**
 * Inject the confirmation handler array if provided by a parent context
 */
export function injectConfirmationHandlerArray<
	TConfirmation
>(): ProvideConfirmationHandlerArrayResult<TConfirmation> {
	const confirmations = inject(CONFIRMATION_ARRAY_KEY, null);
	if (!confirmations) throw new Error(`provideConfirmationHandlerArray was not called`);
	return {
		confirmations: confirmations as Ref<ConfirmationHandlerArrayItem<TConfirmation>[]>,
	};
}
