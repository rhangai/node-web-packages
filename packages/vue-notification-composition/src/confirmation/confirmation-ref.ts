import { ref, Ref, reactive, nextTick, UnwrapRef, ComputedRef } from '@vue/composition-api';
import { TIMEOUT_DELAY } from '../constants';
import { createUseConfirmation, CreateUseConfirmationResult } from './confirmation';

export type ConfirmationRefHandlerItem<TConfirmation> = {
	id: number;
	confirmation: UnwrapRef<TConfirmation>;
	active: boolean;
	resolve: (value: boolean) => void;
	confirm: () => void;
	reject: () => void;
};

export type CreateUseConfirmationRefResult<TConfirmation> =
	CreateUseConfirmationResult<TConfirmation> & {
		confirmations: ComputedRef<
			ReadonlyArray<Readonly<ConfirmationRefHandlerItem<TConfirmation>>>
		>;
	};

export function createUseConfirmationRef<
	TConfirmation
>(): CreateUseConfirmationRefResult<TConfirmation> {
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
	return { confirm, confirmations };
}
