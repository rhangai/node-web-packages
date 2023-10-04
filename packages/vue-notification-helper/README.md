# @rhangai/vue-notification-helper

Generic notification handler.

## Installation

```sh
yarn add @rhangai/vue-notification-helper
```

## Basic Usage

Create a composable file. Ex: `notification.ts`

```ts
import {
	createNotificationHelper,
	createConfirmationHelper,
} from '@rhangai/vue-notification-helper';

export type Notification = {
	title?: string;
	message: string;
};

export type Confirmation = {
	title?: string;
	message: string;
};

export const { useNotification, useNotificationsHandlers } =
	createNotificationHelper<Notification>();

export const { useConfirmation, useConfirmationsHandlers } =
	createConfirmationHelper<Confirmation>();
```

## Handle the notifications

```vue
<script lang="ts" setup>
import { useNotificationsHandlers, useConfirmationsHandlers } from './my/notification';

/*
 * Array of notification handlers
 * Each item has a
 *   - id: string
 *   - resolve(): void // To be called when
 *   - confirmation
 */
const notifications = useNotificationsHandlers();

/*
 * Array of confirmation handlers
 * Each item has a
 *   - id: string
 *   - confirm()
 *   - reject()
 *   - confirmation
 */
const confirmations = useConfirmationsHandlers();
</script>
<template>
	<div>
		<div class="notification-container">
			<div v-for="{ notification, id, resolve } in notifications" :key="id">
				<p>{{ notification.message }}</p>
				<button @click="resolve()">Ok</button>
			</div>
		</div>
		<div class="confirmations-container">
			<div v-for="{ confirmation, id, confirm, reject } in confirmations" :key="id">
				<p>{{ confirmation.message }}</p>
				<button @click="confirm()">Yes</button>
				<button @click="reject()">No</button>
			</div>
		</div>
		<slot></slot>
	</div>
</template>
```
