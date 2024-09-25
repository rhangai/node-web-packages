import {
	inject,
	type InjectionKey,
	nextTick,
	type Plugin,
	provide,
	type Ref,
	ref,
	shallowReactive,
} from 'vue';
import { TIMEOUT_DELAY } from './constants';

export type NotificationItem<TNotification> = {
	id: string;
	notification: TNotification;
	active: boolean;
	resolve: () => void;
};

type UseNotificationResult<TNotification> = {
	notify(this: void, notification: TNotification): void;
};

type NotificationHelper<TNotification> = {
	NotificationPlugin: Plugin;
	provideNotifications(): void;
	useNotificationsHandlers(this: void): Ref<Array<NotificationItem<TNotification>>>;
	useNotification(this: void): UseNotificationResult<TNotification>;
};

type NotificationProvider = {
	notifications: Ref<Array<NotificationItem<unknown>>>;
	notify(this: void, notification: unknown): void;
};

const NOTIFICATIONS_KEY: InjectionKey<NotificationProvider> = Symbol('notifications');

/**
 * Create the notification helper
 */
export function createNotificationHelper<TNotification>(): NotificationHelper<TNotification> {
	return {
		NotificationPlugin: {
			install(app) {
				app.provide(NOTIFICATIONS_KEY, createNotificationProvider());
			},
		},
		provideNotifications() {
			provide(NOTIFICATIONS_KEY, createNotificationProvider());
		},
		useNotificationsHandlers() {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			const { notifications } = inject(NOTIFICATIONS_KEY)!;
			return notifications as Ref<Array<NotificationItem<TNotification>>>;
		},
		useNotification() {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			const { notify } = inject(NOTIFICATIONS_KEY)!;
			return { notify };
		},
	};
}

/**
 * Create the provider for notification
 */
function createNotificationProvider(): NotificationProvider {
	let notificationIdCounter = 0;
	const notifications: Ref<Array<NotificationItem<unknown>>> = ref([]);
	const notify = (notification: unknown) => {
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
				if (resolved) {
					return;
				}
				resolved = true;
				notificationItem.active = false;
				setTimeout(remove, TIMEOUT_DELAY);
			},
		});
		notifications.value.push(notificationItem);
		void nextTick(() => {
			notificationItem.active = true;
		});
	};
	return {
		notifications,
		notify,
	};
}
