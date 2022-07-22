import { computed, Ref } from 'vue-demi';

export function useHtmlInputElement(inputElementRef: Ref<any>) {
	const inputElementGetCursor = (element: HTMLInputElement) => element.selectionEnd ?? 0;

	const inputElementSetCursor = (element: HTMLInputElement, position: number) => {
		const setSelectionRange = () => {
			element.setSelectionRange(position, position);
		};
		if (element === document.activeElement) {
			setSelectionRange();
			setTimeout(setSelectionRange, 1); // Android Fix
		}
	};

	const inputElement = computed(() => {
		const component = inputElementRef.value;
		if (!component) return null;

		let htmlInputElement: HTMLInputElement;
		const element: HTMLElement = component.$el ?? component;
		if (element.tagName === 'INPUT') {
			htmlInputElement = element as HTMLInputElement;
		} else {
			const inputElements = element.getElementsByTagName('input');
			if (inputElements.length <= 0) return null;
			htmlInputElement = inputElements[0];
		}
		return {
			input: htmlInputElement,
			cursorSet: (p: number) => inputElementSetCursor(htmlInputElement, p),
			cursorGet: () => inputElementGetCursor(htmlInputElement),
		};
	});

	return {
		inputElement,
	};
}
