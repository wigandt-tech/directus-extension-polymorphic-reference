<script setup lang="ts">
import { useApi } from '@directus/extensions-sdk';
import { computed, ref, watch } from 'vue';
import {
	cachedRequest,
	collectionEndpoint,
	templateForCollection,
	useReferencePreview,
	type TemplateEntry,
} from '../shared/use-reference';

const props = withDefaults(
	defineProps<{
		// The field value = the primary key within the target collection.
		value: string | number | null;
		// Sibling column on the same row that holds the target collection name.
		collectionField?: string;
		templates?: TemplateEntry[] | null;
		// Provided by Directus: the collection + field this display is rendered for.
		collection?: string;
		field?: string;
	}>(),
	{
		collectionField: 'entity',
		templates: null,
	},
);

const api = useApi();

const targetCollection = ref<string | null>(null);
const primaryKey = computed<string | number | null>(() => props.value ?? null);

let resolveToken = 0;

// Look up the row by (field == value) to read the target collection from the
// configured sibling field — displays can't see sibling values directly.
async function resolveCollection() {
	const token = ++resolveToken;

	if (props.value == null || props.value === '' || !props.collection || !props.field) {
		targetCollection.value = null;
		return;
	}

	const collectionField = props.collectionField || 'entity';

	try {
		const cacheKey = `sibling:${props.collection}:${props.field}:${collectionField}:${props.value}`;
		const res = await cachedRequest(cacheKey, () =>
			api.get(collectionEndpoint(props.collection!), {
				params: {
					filter: JSON.stringify({ [props.field!]: { _eq: props.value } }),
					fields: collectionField,
					limit: 1,
				},
			}),
		);

		if (token !== resolveToken) return;
		const row = (res.data?.data ?? [])[0] as Record<string, unknown> | undefined;
		const resolved = row?.[collectionField];
		targetCollection.value = typeof resolved === 'string' && resolved.length > 0 ? resolved : null;
	} catch {
		if (token !== resolveToken) return;
		targetCollection.value = null;
	}
}

watch(() => [props.value, props.collection, props.field, props.collectionField], resolveCollection, {
	immediate: true,
});

const template = computed<string | null>(() => templateForCollection(props.templates, targetCollection.value));

const { label, loading } = useReferencePreview({
	collection: targetCollection,
	primaryKey,
	template,
});

const hasValue = computed(() => targetCollection.value != null && primaryKey.value != null && primaryKey.value !== '');

const text = computed(() => label.value || (primaryKey.value != null ? String(primaryKey.value) : ''));
</script>

<template>
	<span class="polymorphic-reference-display">
		<v-skeleton-loader v-if="loading" type="text" />
		<span v-else-if="!hasValue" class="empty">--</span>
		<span v-else>{{ text }}</span>
	</span>
</template>

<style scoped>
.polymorphic-reference-display {
	display: inline-flex;
	align-items: center;
}

.empty {
	color: var(--theme--foreground-subdued);
}
</style>
