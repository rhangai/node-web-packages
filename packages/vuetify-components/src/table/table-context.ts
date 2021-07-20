import { computed, inject, InjectionKey, provide, reactive } from 'vue-demi';

type TableContext = {
	dense: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const APP_TABLE_CONTEXT_KEY: InjectionKey<TableContext> = 'app-table' as any;

export function provideTableContext(context: () => TableContext): void {
	provide(APP_TABLE_CONTEXT_KEY, reactive(computed(context)));
}

export function useTableContext(): { tableContext: TableContext } {
	const tableContext = inject(APP_TABLE_CONTEXT_KEY, null);
	if (!tableContext) throw new Error(`No tableContext provided`);
	return { tableContext };
}
