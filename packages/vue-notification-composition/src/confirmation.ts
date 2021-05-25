import { ref, Ref, reactive, nextTick, UnwrapRef } from '@vue/composition-api';

export type ConfirmationHandler<TConfirmation> = (confirmation: TConfirmation) => Promise<boolean>;

export type ConfirmationRefHandlerItem<TConfirmation> = {
	id: number;
	confirmation: UnwrapRef<TConfirmation>;
	active: boolean;
	resolve: (value: boolean) => void;
	confirm: () => void;
	reject: () => void;
};

export function createUseConfirmation<TConfirmation>() {
	let confirmationHandler: ConfirmationHandler<TConfirmation>;
	const registerConfirmationHandler = (handler: ConfirmationHandler<TConfirmation>) => {
		confirmationHandler = handler;
	};
	const useConfirmation = () => {
		if (!confirmationHandler) {
			throw new Error(`No confirmation handler. Did you call registerConfirmationHandler?`);
		}
		return { confirm: confirmationHandler };
	};
	return { useConfirmation, registerConfirmationHandler };
}

/**
 * @param registerConfirmationHandler
 * @returns
 */
export function useConfirmationRefHandler<TConfirmation>(
	registerConfirmationHandler: (handler: ConfirmationHandler<TConfirmation>) => void
) {
	let confirmationIdCounter = 0;
	const confirmations: Ref<ConfirmationRefHandlerItem<TConfirmation>[]> = ref([]);
	const confirm = (confirmation: TConfirmation) => {
		const confirmationId = confirmationIdCounter;
		confirmationIdCounter += 1;
		return new Promise<boolean>((resolve) => {
			const confirmationItem = reactive({
				id: confirmationId,
				confirmation,
				active: false,
				resolve(value: boolean) {
					confirmationItem.active = false;
					nextTick(() => {
						resolve(value);
						const index = confirmations.value.findIndex((n) => n.id === confirmationId);
						if (index >= 0) {
							confirmations.value.splice(index, 1);
						}
					});
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
	registerConfirmationHandler(confirm);
	return { confirmations };
}
