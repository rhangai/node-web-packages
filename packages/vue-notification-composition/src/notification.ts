import { ref, Ref, reactive, nextTick, UnwrapRef } from '@vue/composition-api';

export type NotificationHandler<TNotification> = (notification: TNotification) => void;

export type NotificationRefHandlerItem<TNotification> = {
	id: number;
	notification: UnwrapRef<TNotification>;
	active: boolean;
	resolve: () => void;
};

/**
 * Create a new useNotification and registerNotificationHandler
 */
export function createUseNotification<TNotification>() {
	let notificationHandler: NotificationHandler<TNotification>;
	const registerNotificationHandler = (handler: NotificationHandler<TNotification>) => {
		notificationHandler = handler;
	};
	const useNotification = () => {
		if (!notificationHandler) {
			throw new Error(`No notification handler. Did you call registerNotificationHandler?`);
		}
		return { notify: notificationHandler };
	};
	return { useNotification, registerNotificationHandler };
}

/**
 * @param registerNotificationHandler
 * @returns
 */
export function useNotificationRefHandler<TNotification>(
	registerNotificationHandler: (handler: NotificationHandler<TNotification>) => void
) {
	let notificationIdCounter = 0;
	const notifications: Ref<NotificationRefHandlerItem<TNotification>[]> = ref([]);
	const notify = (notification: TNotification) => {
		const notificationId = notificationIdCounter;
		notificationIdCounter += 1;
		const notificationItem = reactive({
			id: notificationId,
			notification,
			active: false,
			resolve() {
				notificationItem.active = false;
				nextTick(() => {
					const index = notifications.value.findIndex((n) => n.id === notificationId);
					if (index >= 0) {
						notifications.value.splice(index, 1);
					}
				});
			},
		});
		notifications.value.push(notificationItem);
		nextTick(() => {
			notificationItem.active = true;
		});
	};
	registerNotificationHandler(notify);
	return { notifications };
}
