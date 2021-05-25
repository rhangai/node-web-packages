import {
	InjectionKey,
	provide,
	inject,
	ref,
	Ref,
	reactive,
	nextTick,
	UnwrapRef,
} from '@vue/composition-api';

type NotificationHandler<TNotification> = (notification: TNotification) => void;

type NotificationRefHandlerItem<TNotification> = {
	id: number;
	notification: UnwrapRef<TNotification>;
	active: boolean;
	resolve: () => void;
};

export function createUseNotification<TNotification>() {
	const notificationHandlerKey: InjectionKey<NotificationHandler<TNotification>> =
		Symbol('notification-handler');
	const provideNotificationHandler = (handler: NotificationHandler<TNotification>) => {
		provide(notificationHandlerKey, handler);
	};
	const useNotification = () => {
		const notificationHandler = inject(notificationHandlerKey)!;
		const notify = (notification: TNotification) => {
			notificationHandler(notification);
		};
		return { notify };
	};
	return [useNotification, provideNotificationHandler];
}

/**
 * @param provideFunction
 * @returns
 */
export function useNotificationRefHandler<TNotification>(
	provideFunction: (handler: NotificationHandler<TNotification>) => void
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
	provideFunction(notify);
	return [notify, notifications];
}
