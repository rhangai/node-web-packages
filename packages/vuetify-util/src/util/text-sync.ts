/* eslint-disable no-param-reassign */
import { Ref } from 'vue-demi';
import { useHtmlInputElement } from './input-element';

export function useTextFieldSyncCursor(textFieldRef: Ref<any>, view: Ref<string | null>) {
	const { inputElement } = useHtmlInputElement(textFieldRef);

	const textFieldOnInput = (viewValue: string) => {
		view.value = viewValue;
		const inputObj = inputElement.value;
		if (inputObj) {
			const { input } = inputObj;
			let positionFromEnd = (viewValue?.length ?? 0) - inputObj.cursorGet();
			const decimalViewValue = view.value;
			input.value = decimalViewValue;
			positionFromEnd = Math.max(positionFromEnd, 0);
			positionFromEnd = decimalViewValue.length - positionFromEnd;
			inputObj.cursorSet(positionFromEnd);
			textFieldRef.value.lazyValue = decimalViewValue;
		}
	};
	return {
		textFieldOnInput,
	};
}
