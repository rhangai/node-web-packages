import { ref, Ref, reactive, nextTick, UnwrapRef } from '@vue/composition-api';
import { TIMEOUT_DELAY } from '../constants';
import { createUseNotification, CreateUseNotificationResult } from './notification';

export type NotificationRefHandlerItem<TNotification> = {
	id: number;
	notification: UnwrapRef<TNotification>;
	active: boolean;
	resolve: () => void;
};

export type CreateUseNotificationRefResult<TNotification> =
	CreateUseNotificationResult<TNotification> & {
		notifications: Readonly<
			Ref<ReadonlyArray<Readonly<NotificationRefHandlerItem<TNotification>>>>
		>;
	};

/**
 * Create a new useNotification and a notification array to be consumed to show all notifications
 */
export function createUseNotificationRef<
	TNotification
>(): CreateUseNotificationRefResult<TNotification> {
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
	return { notifications, notify };
}
