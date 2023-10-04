import {
	Ref,
	nextTick,
	ref,
	shallowReactive,
	provide,
	InjectionKey,
	inject,
	isVue2,
} from 'vue-demi';
import { TIMEOUT_DELAY } from './constants';

export type NotificationItem<TNotification> = {
	id: string;
	notification: TNotification;
	active: boolean;
	resolve: () => void;
};

type NotificationHelper<TNotification> = {
	install(app: unknown): void;
	provideNotifications(): void;
	useNotificationsHandlers(): Ref<NotificationItem<TNotification>[]>;
	useNotification(): {
		notify(notification: TNotification): void;
	};
};

type NotificationProvider = {
	notifications: Ref<NotificationItem<unknown>[]>;
	notify(notification: unknown): void;
};

const NOTIFICATIONS_KEY: InjectionKey<NotificationProvider> = Symbol('notifications');

/**
 * Create the notification helper
 */
export function createNotificationHelper<TNotification>(): NotificationHelper<TNotification> {
	function createProvider(): NotificationProvider {
		let notificationIdCounter = 0;
		const notifications: Ref<NotificationItem<TNotification>[]> = ref([]);
		const notify = (notification: TNotification) => {
			let resolved = false;
			const notificationId = `notification:${notificationIdCounter}`;
			notificationIdCounter += 1;

			const remove = () => {
				const index = notifications.value.findIndex((n) => n.id === notificationId);
				if (index >= 0) {
					notifications.value.splice(index, 1);
				}
			};

			const notificationItem = shallowReactive({
				id: notificationId,
				notification,
				active: false,
				resolve() {
					if (resolved) return;
					resolved = true;
					notificationItem.active = false;
					setTimeout(remove, TIMEOUT_DELAY);
				},
			});
			notifications.value.push(notificationItem);
			nextTick(() => {
				notificationItem.active = true;
			});
		};
		return {
			notifications,
			notify,
		};
	}

	return {
		install(app: any) {
			if (isVue2) throw new Error(`Using vue2. Please use provideNotifications instead`);
			if ('provide' in app) {
				app.provide(NOTIFICATIONS_KEY, createProvider());
			}
		},
		provideNotifications() {
			if (!isVue2) throw new Error(`Not using vue2. Please use the plugin instead`);
			const provider = createProvider();
			provide(NOTIFICATIONS_KEY, provider);
		},
		useNotificationsHandlers() {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			const { notifications } = inject(NOTIFICATIONS_KEY)!;
			return notifications as Ref<NotificationItem<TNotification>[]>;
		},
		useNotification() {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			const { notify } = inject(NOTIFICATIONS_KEY)!;
			return { notify };
		},
	};
}
