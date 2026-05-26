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
		value: unknown;
		// 'value'   → the field value is self-describing ({ collection, id } / "collection:id")
		// 'sibling' → the value is just the id; the collection lives in a sibling column of the same row
		source?: 'value' | 'sibling';
		collectionField?: string;
		format?: 'json' | 'string';
		separator?: string;
		collectionKey?: string;
		idKey?: string;
		templates?: TemplateEntry[] | null;
		enableLink?: boolean;
		// Provided by Directus: the collection + field this display is rendered for.
		collection?: string;
		field?: string;
	}>(),
	{
		source: 'value',
		collectionField: 'entity',
		format: 'json',
		separator: ':',
		collectionKey: 'collection',
		idKey: 'id',
		templates: null,
		enableLink: true,
	},
);

const api = useApi();

const targetCollection = ref<string | null>(null);
const primaryKey = ref<string | number | null>(null);

let resolveToken = 0;

/** Parse a self-describing value into { collection, id }. */
function parseSelfDescribing(): { collection: string | null; id: string | number | null } {
	const value = props.value;
	if (value == null || value === '') return { collection: null, id: null };

	if (props.format === 'string') {
		const sep = props.separator || ':';
		const str = String(value);
		const idx = str.indexOf(sep);
		if (idx === -1) return { collection: null, id: null };
		return { collection: str.slice(0, idx) || null, id: str.slice(idx + sep.length) || null };
	}

	if (typeof value === 'object') {
		const obj = value as Record<string, unknown>;
		const collection = obj[props.collectionKey || 'collection'];
		const id = obj[props.idKey || 'id'];
		return {
			collection: typeof collection === 'string' && collection.length > 0 ? collection : null,
			id: (id as string | number) ?? null,
		};
	}

	return { collection: null, id: null };
}

async function resolve() {
	const token = ++resolveToken;

	if (props.source === 'sibling') {
		// The value is the id; look up the row by (field == value) to read the
		// collection from the configured sibling field of the same row.
		if (props.value == null || props.value === '' || !props.collection || !props.field) {
			targetCollection.value = null;
			primaryKey.value = null;
			return;
		}

		primaryKey.value = props.value as string | number;
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

		return;
	}

	// Self-describing value
	const parsed = parseSelfDescribing();
	targetCollection.value = parsed.collection;
	primaryKey.value = parsed.id;
}

watch(
	() => [props.value, props.source, props.collection, props.field, props.collectionField],
	resolve,
	{ immediate: true },
);

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
		<router-link v-else-if="enableLink && route" :to="route" class="reference-link" @click.stop>
			<v-icon name="open_in_new" x-small left />
			<span>{{ text }}</span>
		</router-link>
		<span v-else>{{ text }}</span>
	</span>
</template>

<style scoped>
.polymorphic-reference-display {
	display: inline-flex;
	align-items: center;
}

.reference-link {
	display: inline-flex;
	align-items: center;
	color: var(--theme--primary);
	text-decoration: none;
}

.reference-link:hover {
	text-decoration: underline;
}

.empty {
	color: var(--theme--foreground-subdued);
}
</style>
