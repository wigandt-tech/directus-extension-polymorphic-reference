<script setup lang="ts">
import { useApi } from '@directus/extensions-sdk';
import { computed, ref, watch } from 'vue';
import {
	buildRoute,
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
		enableLink?: boolean;
		// Provided by Directus: the collection + field this display is rendered for.
		collection?: string;
		field?: string;
	}>(),
	{
		collectionField: 'entity',
		templates: null,
		enableLink: true,
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
		const res = await api.get(collectionEndpoint(props.collection), {
			params: {
				filter: JSON.stringify({ [props.field]: { _eq: props.value } }),
				fields: collectionField,
				limit: 1,
			},
		});

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

const route = computed<string | null>(() =>
	hasValue.value ? buildRoute(targetCollection.value as string, primaryKey.value as string | number) : null,
);

const text = computed(() => label.value || (primaryKey.value != null ? String(primaryKey.value) : ''));
</script>

<template>
	<span class="polymorphic-reference-display">
		<v-skeleton-loader v-if="loading" type="text" />
		<span v-else-if="!hasValue" class="empty">--</span>
		<template v-else>
			<router-link v-if="enableLink && route" :to="route" class="reference-icon" @click.stop>
				<v-icon name="launch" x-small />
			</router-link>
			<span class="reference-text">{{ text }}</span>
		</template>
	</span>
</template>

<style scoped>
.polymorphic-reference-display {
	display: inline-flex;
	align-items: center;
	gap: 4px;
}

/* Only the icon is a link; the text stays plain. */
.reference-icon {
	display: inline-flex;
	align-items: center;
	color: var(--theme--foreground-subdued);
	text-decoration: none;
}

.reference-icon:hover {
	color: var(--theme--primary);
}

.reference-text {
	color: var(--theme--foreground);
}

.empty {
	color: var(--theme--foreground-subdued);
}
</style>
