import { Ref, watch, computed, unref, reactive } from '@vue/composition-api';

export type UseSelectOptions<T, TId> = {
	props: { value: unknown };
	emit: (event: string, value: unknown) => void;
	items:
		| null
		| undefined
		| T[]
		| ReadonlyArray<T>
		| Readonly<Ref<null | undefined | T[] | ReadonlyArray<T>>>;
	itemValue: (v: T) => TId;
};

type UseSelectState<T, TId> = {
	value: TId | null;
	object: T | null;
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
	type ItemsMap = Record<TId, { item: T; itemValue: TId; index: number }>;
	type ItemsData = { itemsMap: ItemsMap; items: T[] };

	const selectState = reactive({
		value: null as TId | null,
		object: null as T | null,
	}) as UseSelectState<T, TId>;

	const selectItemsData = computed<ItemsData>(() => {
		const optionsItems = unref(options.items);
		const items = optionsItems ? optionsItems.slice(0) : [];
		const itemsMap = {} as ItemsMap;
		items.forEach((item, index) => {
			const itemValue = options.itemValue(item);
			itemsMap[itemValue] = { item, itemValue, index };
		});
		if (selectState.object) {
			const objectValue = options.itemValue(selectState.object);
			if (objectValue != null) {
				const itemEntry = itemsMap[objectValue];
				if (!itemEntry) {
					itemsMap[objectValue] = {
						itemValue: objectValue,
						item: selectState.object,
						index: -1,
					};
					items.unshift(selectState.object);
				} else {
					const item = items[itemEntry.index];
					items.splice(itemEntry.index, 1);
					items.unshift(item);
				}
			}
		}
		return { itemsMap, items };
	});

	const selectItems = computed<ReadonlyArray<T>>(() => {
		return selectItemsData.value.items;
	});

	const isObject = (value: unknown): value is T => {
		return typeof value === 'object';
	};

	const updateValue = (value: unknown, itemsData: ItemsData) => {
		const { itemsMap } = itemsData;
		if (value == null) {
			selectState.value = null;
			selectState.object = null;
			options.emit('input', selectState.value);
			options.emit('update:selected', selectState.object);
			return;
		}
		if (isObject(value)) {
			selectState.object = value;
			selectState.value = options.itemValue(value);
			options.emit('input', selectState.value);
			options.emit('update:selected', selectState.object);
			return;
		}
		const valueId = value as TId;
		const itemEntry = itemsMap[valueId] ?? null;
		if (itemEntry) {
			selectState.object = itemEntry.item;
			selectState.value = valueId;
		} else {
			selectState.object = null;
			selectState.value = null;
		}
		options.emit('input', selectState.value);
		options.emit('update:selected', selectState.object);
	};

	const selectItem = computed<T | null>({
		get: () => selectState.object,
		set(valueParam: T | TId | null) {
			updateValue(valueParam, selectItemsData.value);
		},
	});

	watch(
		() => ({ value: options.props.value, itemsMap: selectItemsData.value }),
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
