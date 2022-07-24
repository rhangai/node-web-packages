# @rhangai/vue-notification-helper

Generic notification handler.

## Installation

```sh
yarn add @rhangai/vue-notification-helper
```

## Basic Usage

Create a `notification.ts` composable file

```ts
import { useNotificationHelper, useConfirmationHelper } from '@rhangai/vue-notification-helper';

export type Notification = {
	title?: string;
	message: string;
};

export type Confirmation = {
	title?: string;
	message: string;
};

export function useNotification() {
	return useNotificationHelper<Notification>();
}

export function useConfirmation() {
	return useConfirmationHelper<Confirmation>();
}
```

And a `notification-provider.vue`

```vue
<script lang="ts" setup>
import {
	provideNotificationHelper,
	provideConfirmationHelper,
} from '@rhangai/vue-notification-helper';
import type { Confirmation, Notification } from './my/notification';

provideNotificationHelper((notification: Notification) => {
	window.alert(confirmation.message);
});
provideConfirmationHelper((confirmation: Confirmation) => {
	return window.confirm(confirmation.message);
});
</script>
<template>
	<div><slot /></div>
</template>
```

## Better approach

```vue
<script lang="ts" setup>
import {
	provideNotificationHelperArray,
	provideConfirmationHelperArray,
} from '@rhangai/vue-notification-helper';
import type { Confirmation, Notification } from './my/notification';

const { notifications } = provideNotificationHelperArray((notification: Notification) => {
	window.alert(confirmation.message);
});
const { confirmations } = provideConfirmationHelperArray((confirmation: Confirmation) => {
	return window.confirm(confirmation.message);
});
</script>
<template>
	<div>
		<div class="notification-container">
			<div v-for="notification in notifications" :key="notification.id">
				<p>{{ notification.message }}</p>
				<button @click="notification.resolve()">Ok</button>
			</div>
		</div>
		<div class="confirmations-container">
			<div v-for="confirmation in confirmations" :key="confirmation.id">
				<p>{{ confirmation.message }}</p>
				<button @click="confirmation.confirm()">Yes</button>
				<button @click="confirmation.reject()">No</button>
			</div>
		</div>
		<slot />
	</div>
</template>
```
