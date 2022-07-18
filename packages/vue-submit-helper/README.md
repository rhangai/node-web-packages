# @rhangai/vue-submit-helper

Simplify your submission logic.

## Installation

```sh
yarn add @rhangai/vue-submit-helper
```

## Basic Usage

Create a `submit.ts` composable file

```ts
import { useSubmitHelper, useSubmitMultipleHelper } from '@rhangai/vue-submit-helper';

export const useSubmit = useSubmitHelper;
export const useSubmitMultiple = useSubmitHelperMultiple;
```

### Simple form submission

```vue
<script setup>
import axios from 'axios';
import { useSubmit } from './my/submit';

const form = reactive({
	name: '',
});

const { submit, submitting } = useSubmit(() =>
	axios({
		method: 'post',
		url: 'some url',
		data: form,
	})
);
</script>
<template>
	<form @submit.prevent="submit">
		<div>Name: <input name="name" v-model="form.name" :disabled="submitting" /></div>
		<button type="submit" :disabled="submitting">Submit</button>
	</form>
</template>
```

### Multiple submissions

```vue
<script setup>
import axios from 'axios';
import { useSubmitMultiple } from './my/submit';

const items = [
	{
		id: 1,
		name: 'John',
	},
	{
		id: 2,
		name: 'Mary',
	},
];

const { submit, isSubmitting } = useSubmitMultiple(
	(item) =>
		axios({
			method: 'post',
			url: 'some url',
			data: { id: item.id },
		}),
	(item) => item.id
);
</script>
<template>
	<div>
		<div v-for="item in items" :key="item.id">
			<button @click="submit(item)" :disabled="isSubmitting(item)">
				Delete Item {{ item.name }}
			</button>
		</div>
	</div>
</template>
```

## Custom Submit Logic

A more complex example using a custom submit logic and some notification, confirmation and axios

```ts
import {
	useSubmitHelper,
	useSubmitHelperMultiple,
	UseSubmitHelperOptions,
	UseSubmitHelperResult,
	UseSubmitHelperMultipleResult,
} from '@rhangai/vue-submit-helper';
import axios, { AxiosResponse, AxiosRequestConfig } from 'axios';
import { useConfirm } from 'my-confirmation-lib';
import { useNotify } from 'my-notification-lib';

/**
 * UseSubmit options
 */
export type UseSubmitOptions<TArg, TResult> = UseSubmitHelperOptions<TArg, TResult> & {
	confirmation?: (args: TArg) => string;
	notificationSuccess?: (result: TResult, arg: TArg) => string;
	notificationError?: (error: unknown, arg: TArg) => string;
	notificationValidateError?: (error: unknown, arg: TArg) => string;
};

/**
 * Implements the useSubmitAxios
 */
export function useSubmitAxios<TArg = void, TData = any>(
	config: (arg: TArg) => AxiosRequestConfig | Promise<AxiosRequestConfig>,
	options: UseSubmitOptions<TArg, AxiosResponse<TData>> = {}
): UseSubmitHelperResult<TArg, AxiosResponse<TData>> {
	const submitOptions = useDefaultAxiosSubmitOptions<TArg, TData>(options);
	const request = async (arg: TArg) => axios(await config(arg));
	return useSubmitHelper(request, submitOptions);
}

/**
 * Implements the useSubmitAxiosMultiple
 */
export function useSubmitAxiosMultiple<TArg, TData = any>(
	config: (arg: TArg) => AxiosRequestConfig | Promise<AxiosRequestConfig>,
	keyGetter: (arg: TArg) => string,
	options: UseSubmitOptions<TArg, AxiosResponse<TData>> = {}
): UseSubmitHelperMultipleResult<TArg, AxiosResponse<TData>> {
	const submitOptions = useDefaultAxiosSubmitOptions<TArg, TData>(options);
	const request = async (arg: TArg) => axios(await config(arg));
	return useSubmitHelperMultiple(request, keyGetter, submitOptions);
}

/**
 * Get the default submit options
 */
function useDefaultAxiosSubmitOptions<TArg, TData = any>(
	options: UseSubmitOptions<TArg, AxiosResponse<TData>>
): UseSubmitHelperOptions<TArg, AxiosResponse<TData>> {
	const {
		confirmation,
		notificationSuccess,
		notificationError,
		notificationValidateError,
		...submitOptions
	} = options;
	const { notify } = useNotify();
	const { confirm } = useConfirm();
	return {
		...submitOptions,
		async prepare(arg) {
			if (confirmation != null) {
				const confirmResult = await confirm(confirmation(arg));
				if (confirmResult === false) return false;
			}
			return submitOptions.prepare?.(arg);
		},
		async onSuccess(result, arg) {
			await submitOptions?.onSuccess?.(result, arg);
			notify(notificationSuccess?.(result, arg) ?? 'Success');
		},
		async onError(error, arg) {
			await submitOptions?.onError?.(error, arg);
			notify(notificationError?.(error, arg) ?? 'Error');
		},
		async onValidateError(error, arg) {
			await submitOptions?.onValidateError?.(error, arg);
			notify(notificationValidateError?.(error, arg) ?? 'Error validating');
		},
	};
}
```
