/* eslint-disable no-param-reassign */
export function authCreateStore() {
	return {
		state: () => ({
			user: null,
			data: null,
		}),
		mutations: {
			set(state: any, payload: any) {
				state.user = payload.user;
				state.data = payload.data;
			},
			user(state: any, payload: any) {
				state.user = payload ? { ...payload } : null;
			},
		},
	};
}
