import { ref, Ref, reactive, nextTick, UnwrapRef } from 'vue-demi';
import { TIMEOUT_DELAY } from '../constants';
import { provideNotificationHandler } from './notification-handler';

/**
 * Type for the notification handler
 */
export type NotificationHandlerArrayItem<TNotification> = {
	id: number;
	notification: UnwrapRef<TNotification>;
	active: boolean;
	resolve: () => void;
};

/**
 * Type for the result of array of notifications
 */
export type ProvideNotificationHandlerArrayResult<TNotification> = {
	notifications: Readonly<
		Ref<ReadonlyArray<Readonly<NotificationHandlerArrayItem<TNotification>>>>
	>;
};

/**
 * Provide a notification handler using an array of items
 */
export function provideNotificationHandlerArray<
	TNotification
>(): ProvideNotificationHandlerArrayResult<TNotification> {
	let notificationIdCounter = 0;
	const notifications: Ref<NotificationHandlerArrayItem<TNotification>[]> = ref([]);
	const notify = (notification: TNotification) => {
		let resolved = false;
		const notificationId = notificationIdCounter;
		notificationIdCounter += 1;

		const remove = () => {
			const index = notifications.value.findIndex((n) => n.id === notificationId);
			if (index >= 0) {
				notifications.value.splice(index, 1);
			}
		};

		const notificationItem = reactive({
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
	provideNotificationHandler<TNotification>(notify);
	return {
		notifications,
	};
}
