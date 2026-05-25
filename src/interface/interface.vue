<script setup lang="ts">
import { computed, inject, ref } from 'vue';
import {
	buildRoute,
	templateForCollection,
	useReferencePreview,
	type TemplateEntry,
} from '../shared/use-reference';

const props = withDefaults(
	defineProps<{
		value: string | number | null;
		collectionField?: string;
		templates?: TemplateEntry[] | null;
		enableLink?: boolean;
	}>(),
	{
		collectionField: 'entity',
		templates: null,
		enableLink: true,
	},
);

// All field values of the item currently being edited — this is how we reach the
// sibling `entity`/collection field. Injected by the Directus form.
const values = inject<{ value: Record<string, unknown> }>('values', ref({}));

const targetCollection = computed<string | null>(() => {
	const key = props.collectionField || 'entity';
	const raw = values.value?.[key];
	return typeof raw === 'string' && raw.length > 0 ? raw : null;
});

const primaryKey = computed<string | number | null>(() => props.value ?? null);

const template = computed<string | null>(() => templateForCollection(props.templates, targetCollection.value));

const { label, loading } = useReferencePreview({
	collection: targetCollection,
	primaryKey,
	template,
});

const hasValue = computed(() => targetCollection.value != null && props.value != null && props.value !== '');

const route = computed<string | null>(() =>
	hasValue.value ? buildRoute(targetCollection.value as string, props.value as string | number) : null,
);

const text = computed(() => label.value || (props.value != null ? String(props.value) : ''));
</script>

<template>
	<div class="polymorphic-reference-interface">
		<v-skeleton-loader v-if="loading" type="input" />

		<template v-else>
			<span v-if="!hasValue" class="empty">--</span>

			<router-link v-else-if="enableLink && route" :to="route" class="reference-link">
				<v-chip small outlined clickable>
					<v-icon name="open_in_new" x-small left />
					<span class="text">{{ text }}</span>
					<span class="collection">{{ targetCollection }}</span>
				</v-chip>
			</router-link>

			<v-chip v-else small outlined>
				<span class="text">{{ text }}</span>
				<span class="collection">{{ targetCollection }}</span>
			</v-chip>
		</template>
	</div>
</template>

<style scoped>
.polymorphic-reference-interface {
	display: flex;
	align-items: center;
	min-height: var(--theme--form--field--input--height, 60px);
}

.reference-link {
	text-decoration: none;
}

.text {
	font-family: var(--theme--fonts--monospace--font-family);
}

.collection {
	margin-left: 6px;
	padding-left: 6px;
	border-left: 1px solid var(--theme--border-color-subdued);
	color: var(--theme--foreground-subdued);
	font-size: 11px;
	text-transform: lowercase;
}

.empty {
	color: var(--theme--foreground-subdued);
}
</style>
