import { computed, inject, InjectionKey, provide, reactive } from 'vue-demi';

type AppTableContext = {
	dense: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const APP_TABLE_CONTEXT_KEY: InjectionKey<AppTableContext> = 'app-table' as any;

export function provideTableContext(context: () => AppTableContext): void {
	provide(APP_TABLE_CONTEXT_KEY, reactive(computed(context)));
}

export function useTableContext(): { tableContext: AppTableContext } {
	const tableContext = inject(APP_TABLE_CONTEXT_KEY, null);
	if (!tableContext) throw new Error(`No tableContext provided`);
	return { tableContext };
}
