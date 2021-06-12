import axios, { AxiosRequestConfig, CancelToken, CancelTokenSource } from 'axios';

export enum AuthResponseStatus {
	UNAUTHORIZED,
	AUTHORIZED,
}

type AuthRequestServiceOptions = {
	interval: number;
	authRequestConfig: AxiosRequestConfig;
	onLogout(): void;
	onError(err: Error): void;
};

type AuthRefreshCallback = (payload: any) => unknown | Promise<unknown>;

type AuthResponse = {
	authStatus: AuthResponseStatus | null;
	cancel?: boolean;
	data?: any;
	error?: Error | null;
};

export class AuthRequestService {
	private timeout: any = null;

	private cancelTokenSource: CancelTokenSource | null = null;

	constructor(private readonly options: AuthRequestServiceOptions) {}

	cancel(): void {
		if (this.timeout) {
			clearTimeout(this.timeout);
			this.timeout = null;
		}
		if (this.cancelTokenSource) {
			this.cancelTokenSource.cancel();
			this.cancelTokenSource = null;
		}
	}

	async refresh(cb: AuthRefreshCallback): Promise<AuthResponse> {
		this.cancel();
		const cancelTokenSource = axios.CancelToken.source();
		const response = this.doRequest(cancelTokenSource.token);
		this.timeoutStart(cb);
		return response;
	}

	private async doRequest(cancelToken: CancelToken | null): Promise<AuthResponse> {
		try {
			const result = await axios({
				...this.options.authRequestConfig,
				cancelToken: cancelToken ?? undefined,
				validateStatus(status) {
					return status === 200 || status === 401;
				},
			});
			if (result.status === 401) {
				return { authStatus: AuthResponseStatus.UNAUTHORIZED };
			}
			return { data: result.data, authStatus: AuthResponseStatus.AUTHORIZED };
		} catch (err) {
			if (axios.isCancel(err)) {
				return { cancel: true, authStatus: null, error: err };
			}
			return { error: err, authStatus: null };
		}
	}

	private timeoutStart(cb: AuthRefreshCallback) {
		this.timeout = setTimeout(async () => {
			this.timeout = null;
			const { authStatus, error, data } = await this.doRequest(null);
			if (authStatus === AuthResponseStatus.UNAUTHORIZED) {
				this.options.onLogout();
				return;
			} else if (authStatus === AuthResponseStatus.AUTHORIZED) {
				try {
					await cb(data);
				} catch (err) {
					this.options.onError(err);
				}
			} else if (error) {
				this.options.onError(error);
			}
			this.timeoutStart(cb);
		}, this.options.interval);
	}
}
