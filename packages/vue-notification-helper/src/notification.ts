import { Ref, nextTick, ref, shallowReactive } from 'vue-demi';
import { TIMEOUT_DELAY } from './constants';

export type NotificationItem<TNotification> = {
	id: string;
	notification: TNotification;
	active: boolean;
	resolve: () => void;
};

type NotificationHelper<TNotification> = {
	useNotificationsHandlers(): Ref<NotificationItem<TNotification>[]>;
	useNotification(): {
		notify(notification: TNotification): void;
	};
};

/**
 * Create the notification helper
 */
export function createNotificationHelper<TNotification>(): NotificationHelper<TNotification> {
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
		useNotificationsHandlers() {
			return notifications;
		},
		useNotification() {
			return { notify };
		},
	};
}
