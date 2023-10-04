import { Ref, nextTick, ref, shallowReactive } from 'vue-demi';
import { TIMEOUT_DELAY } from './constants';

export type ConfirmationItem<TConfirmation> = {
	id: string;
	confirmation: TConfirmation;
	active: boolean;
	resolve: (value: boolean) => void;
	/// Shortcut for confirmation.resolve(true);
	confirm: () => void;
	/// Shortcut for confirmation.resolve(false);
	reject: () => void;
};

type ConfirmationHelper<TConfirmation> = {
	useConfirmationsHandlers(): Ref<ConfirmationItem<TConfirmation>[]>;
	useConfirmation(): {
		confirm(confirmation: TConfirmation): Promise<boolean>;
	};
};

/**
 * Create the confirmation helper
 */
export function createConfirmationHelper<TConfirmation>(): ConfirmationHelper<TConfirmation> {
	let confirmationIdCounter = 0;
	const confirmations: Ref<ConfirmationItem<TConfirmation>[]> = ref([]);
	const confirm = (confirmation: TConfirmation) => {
		const confirmationId = `confirmation:${confirmationIdCounter}`;
		confirmationIdCounter += 1;
		return new Promise<boolean>((resolve) => {
			let resolved = false;
			const confirmationItem = shallowReactive({
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
	return {
		useConfirmation() {
			return { confirm };
		},
		useConfirmationsHandlers() {
			return confirmations;
		},
	};
}
