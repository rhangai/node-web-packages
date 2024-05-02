import {
	inject,
	nextTick,
	ref,
	shallowReactive,
	type App,
	type InjectionKey,
	type Ref,
	type Plugin,
} from 'vue';
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

type UseConfirmationResult<TConfirmation> = {
	confirm(this: void, confirmation: TConfirmation): Promise<boolean>;
};

type ConfirmationHelper<TConfirmation> = {
	ConfirmationPlugin: Plugin;
	useConfirmationsHandlers(this: void): Ref<ConfirmationItem<TConfirmation>[]>;
	useConfirmation(this: void): UseConfirmationResult<TConfirmation>;
};

type ConfirmationProvider = {
	confirmations: Ref<ConfirmationItem<unknown>[]>;
	confirm(this: void, confirmation: unknown): Promise<boolean>;
};

const CONFIRMATIONS_KEY: InjectionKey<ConfirmationProvider> = Symbol('confirmations');

/**
 * Create the confirmation helper
 */
export function createConfirmationHelper<TConfirmation>(): ConfirmationHelper<TConfirmation> {
	return {
		ConfirmationPlugin: {
			install(app: App) {
				app.provide(CONFIRMATIONS_KEY, createConfirmationProvider());
			},
		},
		useConfirmationsHandlers() {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			const { confirmations } = inject(CONFIRMATIONS_KEY)!;
			return confirmations as Ref<ConfirmationItem<TConfirmation>[]>;
		},
		useConfirmation() {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			const { confirm } = inject(CONFIRMATIONS_KEY)!;
			return { confirm };
		},
	};
}

/**
 * Create the confirmation provider
 * @returns
 */
function createConfirmationProvider(): ConfirmationProvider {
	let confirmationIdCounter = 0;
	const confirmations: Ref<ConfirmationItem<unknown>[]> = ref([]);
	const confirm = (confirmation: unknown) => {
		const confirmationId = `confirmation:${confirmationIdCounter}`;
		confirmationIdCounter += 1;
		return new Promise<boolean>((resolve) => {
			let resolved = false;
			const confirmationItem = shallowReactive({
				id: confirmationId,
				confirmation,
				active: false,
				resolve(value: boolean) {
					if (resolved) {
						return;
					}
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
			void nextTick(() => {
				confirmationItem.active = true;
			});
		});
	};
	return {
		confirmations,
		confirm,
	};
}
