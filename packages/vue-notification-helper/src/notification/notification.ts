import { injectNotificationHandler, NotificationHandler } from './notification-handler';

export type UseNotificationHelperResult<TNotification> = {
	notify: NotificationHandler<TNotification>;
};

/**
 * Create a new useNotification and a notification array to be consumed to show all notifications
 */
export function useNotificationHelper<TNotification>(): UseNotificationHelperResult<TNotification> {
	const ctx = injectNotificationHandler();
	if (!ctx) throw new Error(`provideNotificationHandler not called`);
	return {
		notify: ctx.notificationHandler,
	};
}
