import { ComputedRef, watch, computed, unref, reactive } from '@vue/composition-api';

export type UseSelectOptions<T, TId> = {
	props: { value: T | TId | null };
	emit: (event: string, value: unknown) => void;
	items: null | undefined | T[] | ReadonlyArray<T> | ComputedRef<null | undefined | T[] | ReadonlyArray<T>>;
	itemValue: (v: T) => TId;
};

type UseSelectState<T, TId> = {
	value: TId | null;
	object: T | null;
	appendObject: boolean;
};

/**
 * Select items emitting the update:selected event with the selected object and input with the selected value
 *
 * @example
 *   <v-select v-model="selectItem" :items="selectItems" item-value="value" item-text="text" />
 *
 *   const { selectItem, selectItems } = useSelect({ props, emit, items, value: v => v.id })
 */
export function useSelect<T, TId extends string | number>(options: UseSelectOptions<T, TId>) {
	const selectState = reactive({
		value: null as TId | null,
		object: null as T | null,
		appendObject: false,
	}) as UseSelectState<T, TId>;

	const selectItems = computed<ReadonlyArray<T>>(() => {
		let items = unref(options.items) ?? [];
		if (selectState.appendObject && selectState.object) {
			items = [selectState.object as T, ...items];
		}
		return items;
	});

	const selectItemsMap = computed<Record<TId, T> | null>(() => {
		const items = selectItems.value;
		if (!items) return null;

		const itemsMap = {} as Record<TId, T>;
		items.forEach((item) => {
			const key = options.itemValue(item);
			itemsMap[key] = item;
		});
		return itemsMap;
	});

	const updateValue = (value: T | TId | null | undefined, itemsMapValue: Record<TId, T> | null) => {
		if (value == null) {
			selectState.value = null;
			selectState.object = null;
			selectState.appendObject = false;
			options.emit('input', selectState.value);
			options.emit('update:selected', selectState.object);
			return;
		}
		if (typeof value === 'object') {
			selectState.object = value;
			selectState.value = options.itemValue(value);
			selectState.appendObject = true;
			options.emit('input', selectState.value);
			options.emit('update:selected', selectState.object);
		} else if (itemsMapValue) {
			const valueId = value as TId;
			const item = itemsMapValue[valueId];
			if (item) {
				selectState.object = item;
				selectState.value = valueId;
			} else {
				selectState.object = null;
				selectState.value = null;
			}
			selectState.appendObject = false;
			options.emit('input', selectState.value);
			options.emit('update:selected', selectState.object);
		}
	};

	const selectItem = computed<T | null>({
		get: () => selectState.object,
		set(valueParam: T | TId | null) {
			updateValue(valueParam, selectItemsMap.value);
		},
	});

	watch(
		() => ({ value: options.props.value, itemsMap: selectItemsMap.value }),
		({ value, itemsMap }) => {
			if (value === selectState.value) return;
			updateValue(value, itemsMap);
		},
		{ immediate: true }
	);

	return {
		selectItem,
		selectItems,
	};
}
