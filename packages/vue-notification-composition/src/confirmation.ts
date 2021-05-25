import {
	InjectionKey,
	provide,
	inject,
	ref,
	Ref,
	reactive,
	nextTick,
	UnwrapRef,
} from '@vue/composition-api';

type ConfirmationHandler<TConfirmation> = (confirmation: TConfirmation) => Promise<boolean>;

type ConfirmationRefHandlerItem<TConfirmation> = {
	id: number;
	confirmation: UnwrapRef<TConfirmation>;
	active: boolean;
	resolve: (value: boolean) => void;
	confirm: () => void;
	reject: () => void;
};

export function createUseConfirmation<TConfirmation>() {
	const confirmationHandlerKey: InjectionKey<ConfirmationHandler<TConfirmation>> =
		Symbol('confirmation-handler');
	const provideConfirmationHandler = (handler: ConfirmationHandler<TConfirmation>) => {
		provide(confirmationHandlerKey, handler);
	};
	const useConfirmation = () => {
		const confirmationHandler = inject(confirmationHandlerKey)!;
		return { confirm: confirmationHandler };
	};
	return [useConfirmation, provideConfirmationHandler];
}

/**
 * @param provideFunction
 * @returns
 */
export function useConfirmationRefHandler<TConfirmation>(
	provideFunction: (handler: ConfirmationHandler<TConfirmation>) => void
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
	provideFunction(confirm);
	return [confirm, confirmations];
}
