import { provide, inject, InjectionKey } from 'vue-demi';

const NOTIFICATION_HANDLER_SYMBOL: InjectionKey<NotificationHelperContext<unknown>> = Symbol(
	'@rhangai/vue-notification-helper/notification-handler'
);

export type NotificationHandler<TNotification> = (notification: TNotification) => void;

export type NotificationHelperContext<TNotification> = {
	notificationHandler: NotificationHandler<TNotification>;
};

/**
 * Create the notification ref handler
 */
export function injectNotificationHandler<
	TNotification
>(): NotificationHelperContext<TNotification> | null {
	return inject(NOTIFICATION_HANDLER_SYMBOL, null);
}

/**
 * Create the notification ref handler
 */
export function provideNotificationHandler<TNotification>(
	notificationHandler: NotificationHandler<TNotification>
): void {
	//
	provide(NOTIFICATION_HANDLER_SYMBOL, { notificationHandler });
}
