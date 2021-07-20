import { computed, inject, provide, reactive, InjectionKey } from 'vue-demi';

type AppTableContext = {
	dense: boolean;
};

const APP_TABLE_CONTEXT_KEY: InjectionKey<AppTableContext> = 'app-table' as any;

export function provideTableContext(context: () => AppTableContext) {
	provide(APP_TABLE_CONTEXT_KEY, reactive(computed(context)));
}

export function useTableContext() {
	const tableContext = inject(APP_TABLE_CONTEXT_KEY);
	return { tableContext };
}
