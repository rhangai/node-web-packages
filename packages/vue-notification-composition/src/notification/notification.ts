export type NotificationHandler<TNotification> = (notification: TNotification) => void;
export type CreateUseNotificationOptions<TNotification> = {
	notify: NotificationHandler<TNotification>;
};

export type CreateUseNotificationResult<TNotification> = {
	useNotification: () => { notify: NotificationHandler<TNotification> };
};

export function createUseNotification<TNotification>(
	options: CreateUseNotificationOptions<TNotification>
): CreateUseNotificationResult<TNotification> {
	const useNotification = () => ({ notify: options.notify });
	return { useNotification };
}
