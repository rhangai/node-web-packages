import {
	InjectionKey,
	Ref,
	inject,
	nextTick,
	provide,
	ref,
	shallowReactive,
	isVue2,
	type Plugin,
} from 'vue-demi';
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
	confirmationsPlugin: Plugin;
	provideConfirmations(): void;
	useConfirmationsHandlers(): Ref<ConfirmationItem<TConfirmation>[]>;
	useConfirmation(): {
		confirm(confirmation: TConfirmation): Promise<boolean>;
	};
};

type ConfirmationProvider = {
	confirmations: Ref<ConfirmationItem<unknown>[]>;
	confirm(confirmation: unknown): Promise<boolean>;
};

const CONFIRMATIONS_KEY: InjectionKey<ConfirmationProvider> = Symbol('confirmations');

/**
 * Create the confirmation helper
 */
export function createConfirmationHelper<TConfirmation>(): ConfirmationHelper<TConfirmation> {
	function createProvider(): ConfirmationProvider {
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
							const index = confirmations.value.findIndex(
								(n) => n.id === confirmationId
							);
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
			confirmations,
			confirm,
		};
	}
	return {
		confirmationsPlugin: {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			install(app: any) {
				if (isVue2) throw new Error(`Using vue2. Please use provideConfirmations instead`);
				if ('provide' in app) {
					app.provide(CONFIRMATIONS_KEY, createProvider());
				}
			},
		},
		provideConfirmations() {
			if (!isVue2) throw new Error(`Not using vue2. Please install the plugin instead`);
			const provider = createProvider();
			provide(CONFIRMATIONS_KEY, provider);
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
