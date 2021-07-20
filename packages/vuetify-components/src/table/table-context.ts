import { computed, inject, provide, reactive } from 'vue-demi';
import { defineInjectionKey } from '@@web/lib/util';

type AppTableContext = {
	dense: boolean;
};

const APP_TABLE_CONTEXT_KEY = defineInjectionKey<AppTableContext>('app-table');

export function provideTableContext(context: () => AppTableContext) {
	provide(APP_TABLE_CONTEXT_KEY, reactive(computed(context)));
}

export function useTableContext() {
	const tableContext = inject(APP_TABLE_CONTEXT_KEY);
	return { tableContext };
}
