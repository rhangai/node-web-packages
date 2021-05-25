import { ref, Ref, reactive, nextTick, UnwrapRef } from '@vue/composition-api';

export type NotificationHandler<TNotification> = (notification: TNotification) => void;
export type CreateUseNotificationOptions<TNotification> = {
	notify: NotificationHandler<TNotification>;
};
export type NotificationRefHandlerItem<TNotification> = {
	id: number;
	notification: UnwrapRef<TNotification>;
	active: boolean;
	resolve: () => void;
};

/**
 * Create a new useNotification that delegates the function to notify
 */
export function createUseNotification<TNotification>(options: CreateUseNotificationOptions<TNotification>) {
	const useNotification = () => ({ notify: options.notify });
	return { useNotification };
}

/**
 * Create a new useNotification and a notification array to be consumed to show all notifications
 */
export function createUseNotificationRef<TNotification>() {
	const { notifications, notify } = createNotificationRefHandler<TNotification>();
	const { useNotification } = createUseNotification({ notify });
	return { useNotification, notifications };
}

/**
 * Create the notification ref handler
 */
function createNotificationRefHandler<TNotification>() {
	let notificationIdCounter = 0;
	const notifications: Ref<NotificationRefHandlerItem<TNotification>[]> = ref([]);
	const notify = (notification: TNotification) => {
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
				notificationItem.active = false;
				nextTick(remove);
			},
		});
		notifications.value.push(notificationItem);
		nextTick(() => {
			notificationItem.active = true;
		});
	};
	return { notifications, notify };
}
