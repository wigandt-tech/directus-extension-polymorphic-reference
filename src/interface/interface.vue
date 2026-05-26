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
	<v-skeleton-loader v-if="loading" type="input" />

	<!-- Empty state: looks like a disabled input -->
	<div v-else-if="!hasValue" class="prf-field prf-field--empty">
		<span class="prf-placeholder">{{ targetCollection ? '—' : 'Keine Entität gewählt' }}</span>
	</div>

	<!-- Native-style related-item preview -->
	<div v-else class="prf-field" :class="{ 'prf-field--link': enableLink && route }">
		<component
			:is="enableLink && route ? 'router-link' : 'div'"
			:to="enableLink && route ? route : undefined"
			class="prf-preview"
		>
			<div class="prf-content">
				<span class="prf-label">{{ text }}</span>
				<span class="prf-collection">{{ targetCollection }}</span>
			</div>
		</component>

		<div class="prf-actions">
			<router-link v-if="enableLink && route" v-tooltip="'Datensatz öffnen'" :to="route" class="prf-action" @click.stop>
				<v-icon name="launch" />
			</router-link>
		</div>
	</div>
</template>

<style scoped>
.prf-field {
	display: flex;
	align-items: center;
	width: 100%;
	height: var(--theme--form--field--input--height, 60px);
	padding: 0 8px 0 var(--theme--form--field--input--padding, 16px);
	color: var(--theme--form--field--input--foreground);
	background-color: var(--theme--form--field--input--background);
	border: var(--theme--border-width, 2px) solid var(--theme--form--field--input--border-color);
	border-radius: var(--theme--border-radius);
	transition: border-color var(--fast, 150ms) var(--transition, ease);
}

.prf-field--link:hover {
	border-color: var(--theme--form--field--input--border-color-hover);
}

.prf-field--empty {
	color: var(--theme--foreground-subdued);
}

.prf-preview {
	flex: 1 1 auto;
	min-width: 0;
	display: flex;
	align-items: center;
	height: 100%;
	text-decoration: none;
	color: inherit;
}

.prf-content {
	display: flex;
	align-items: baseline;
	gap: 8px;
	min-width: 0;
}

.prf-label {
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}

.prf-field--link .prf-preview:hover .prf-label {
	color: var(--theme--primary);
}

.prf-collection {
	flex: 0 0 auto;
	padding: 1px 6px;
	color: var(--theme--foreground-subdued);
	font-size: 11px;
	font-family: var(--theme--fonts--monospace--font-family);
	text-transform: lowercase;
	background-color: var(--theme--background-normal);
	border-radius: var(--theme--border-radius);
}

.prf-actions {
	flex: 0 0 auto;
	display: flex;
	align-items: center;
	gap: 2px;
	color: var(--theme--foreground-subdued);
}

.prf-action {
	display: inline-flex;
	color: inherit;
	transition: color var(--fast, 150ms) var(--transition, ease);
}

.prf-action:hover {
	color: var(--theme--primary);
}

.prf-placeholder {
	font-style: italic;
}
</style>
