<script setup lang="ts">
import { useStores } from '@directus/extensions-sdk';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const props = withDefaults(
	defineProps<{
		value: string | null;
		includeSystem?: boolean;
		placeholder?: string;
		disabled?: boolean;
	}>(),
	{
		value: null,
		includeSystem: false,
		placeholder: '',
		disabled: false,
	},
);

const emit = defineEmits<{
	(event: 'input', value: string | null): void;
}>();

const { t } = useI18n();
const { useCollectionsStore } = useStores();
const collectionsStore = useCollectionsStore();

const items = computed(() =>
	collectionsStore.collections
		// Skip folders / presentation-only entries (no underlying table).
		.filter((collection: any) => collection.schema != null)
		// Skip system collections unless explicitly requested.
		.filter((collection: any) => props.includeSystem || !String(collection.collection).startsWith('directus_'))
		.map((collection: any) => ({
			text: collection.name || collection.collection,
			value: collection.collection,
			icon: collection.meta?.icon ?? undefined,
		}))
		.sort((a: { text: string }, b: { text: string }) => a.text.localeCompare(b.text)),
);
</script>

<template>
	<v-select
		:model-value="value"
		:items="items"
		:placeholder="placeholder || t('select_an_item')"
		:disabled="disabled"
		item-icon="icon"
		show-deselect
		@update:model-value="emit('input', $event)"
	/>
</template>
