<template lang="pug">
.app-card-toolbar
	app-toolbar: slot(name='toolbar')
	app-card(v-bind='$attrs'): slot
</template>
<script lang="ts">
import { defineComponent } from '@vue/composition-api';

export default defineComponent({
	inheritAttrs: false,
});
</script>
