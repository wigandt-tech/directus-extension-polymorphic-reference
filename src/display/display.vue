<script setup lang="ts">
import { computed } from 'vue';
import {
	buildRoute,
	templateForCollection,
	useReferencePreview,
	type TemplateEntry,
} from '../shared/use-reference';

const props = withDefaults(
	defineProps<{
		value: unknown;
		format?: 'json' | 'string';
		separator?: string;
		collectionKey?: string;
		idKey?: string;
		templates?: TemplateEntry[] | null;
		enableLink?: boolean;
	}>(),
	{
		format: 'json',
		separator: ':',
		collectionKey: 'collection',
		idKey: 'id',
		templates: null,
		enableLink: true,
	},
);

/** Parse the self-describing value into { collection, id }. */
const parsed = computed<{ collection: string | null; id: string | number | null }>(() => {
	const value = props.value;

	if (value == null || value === '') return { collection: null, id: null };

	if (props.format === 'string') {
		const sep = props.separator || ':';
		const str = String(value);
		const idx = str.indexOf(sep);
		if (idx === -1) return { collection: null, id: null };
		return {
			collection: str.slice(0, idx) || null,
			id: str.slice(idx + sep.length) || null,
		};
	}

	// JSON object (already parsed by Directus for json fields)
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
});

const targetCollection = computed(() => parsed.value.collection);
const primaryKey = computed(() => parsed.value.id);

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
