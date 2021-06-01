export function pjCoreCreateStore() {
	return {
		state: () => ({
			usuario: null,
			data: null,
		}),
		mutations: {
			set(state: any, payload: any) {
				state.usuario = payload.usuario;
				state.data = payload.data;
			},
			usuario(state: any, payload: any) {
				state.usuario = payload ? { ...payload } : null;
			},
		},
	};
}
