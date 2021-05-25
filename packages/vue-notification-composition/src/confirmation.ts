import { ref, Ref, reactive, nextTick, UnwrapRef } from '@vue/composition-api';

export type ConfirmationHandler<TConfirmation> = (confirmation: TConfirmation) => boolean | Promise<boolean>;

export type CreateUseConfirmationOptions<TConfirmation> = {
	confirm: ConfirmationHandler<TConfirmation>;
};

export type ConfirmationRefHandlerItem<TConfirmation> = {
	id: number;
	confirmation: UnwrapRef<TConfirmation>;
	active: boolean;
	resolve: (value: boolean) => void;
	confirm: () => void;
	reject: () => void;
};

export function createUseConfirmation<TConfirmation>(options: CreateUseConfirmationOptions<TConfirmation>) {
	const useConfirmation = () => ({ confirm: options.confirm });
	return { useConfirmation };
}

export function createUseConfirmationRef<TConfirmation>() {
	const { confirm, confirmations } = createConfirmationRefHandler<TConfirmation>();
	const { useConfirmation } = createUseConfirmation<TConfirmation>({ confirm });
	return { useConfirmation, confirmations };
}

function createConfirmationRefHandler<TConfirmation>() {
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
	return { confirm, confirmations };
}
