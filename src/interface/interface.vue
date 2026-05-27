<script setup lang="ts">
import { useApi, useStores } from '@directus/extensions-sdk';
import { computed, inject, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import {
	buildRoute,
	collectionEndpoint,
	filterForCollection,
	getFieldsFromTemplate,
	renderTemplate,
	templateForCollection,
	useReferencePreview,
	type FilterEntry,
	type TemplateEntry,
} from '../shared/use-reference';

const props = withDefaults(
	defineProps<{
		value: string | number | null;
		collectionField?: string;
		templates?: TemplateEntry[] | null;
		filters?: FilterEntry[] | null;
		enableLink?: boolean;
		resultLimit?: number;
		disabled?: boolean;
	}>(),
	{
		collectionField: 'entity',
		templates: null,
		filters: null,
		enableLink: true,
		resultLimit: 25,
		disabled: false,
	},
);

const emit = defineEmits<{
	(event: 'input', value: string | number | null): void;
}>();

const { t } = useI18n();
const api = useApi();
const { useFieldsStore } = useStores();
const fieldsStore = useFieldsStore();

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

const pkField = computed<string>(() => {
	if (!targetCollection.value) return 'id';
	return fieldsStore.getPrimaryKeyFieldForCollection(targetCollection.value)?.field ?? 'id';
});

// --- Selected value preview ------------------------------------------------
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

function renderItemLabel(item: Record<string, unknown>): string {
	if (template.value) return renderTemplate(template.value, item) || String(item[pkField.value]);
	return String(item[pkField.value]);
}

// --- Dropdown / search -----------------------------------------------------
const search = ref('');
const results = ref<Record<string, unknown>[]>([]);
const resultsLoading = ref(false);
let searchToken = 0;
let debounce: ReturnType<typeof setTimeout> | undefined;

async function loadResults() {
	const collection = targetCollection.value;
	if (!collection) {
		results.value = [];
		return;
	}

	const token = ++searchToken;
	resultsLoading.value = true;

	try {
		const fields = Array.from(new Set([pkField.value, ...getFieldsFromTemplate(template.value)])).filter(Boolean);
		const filter = filterForCollection(props.filters, collection);

		const res = await api.get(collectionEndpoint(collection), {
			params: {
				limit: props.resultLimit,
				fields: fields.join(','),
				...(search.value ? { search: search.value } : {}),
				...(filter ? { filter: JSON.stringify(filter) } : {}),
			},
		});

		if (token !== searchToken) return; // superseded
		results.value = (res.data?.data ?? []) as Record<string, unknown>[];
	} catch {
		if (token !== searchToken) return;
		results.value = [];
	} finally {
		if (token === searchToken) resultsLoading.value = false;
	}
}

function onSearch(value: string) {
	search.value = value;
	if (debounce) clearTimeout(debounce);
	debounce = setTimeout(loadResults, 250);
}

function onOpen() {
	if (results.value.length === 0) loadResults();
}

function select(item: Record<string, unknown>) {
	emit('input', (item[pkField.value] as string | number) ?? null);
}

function deselect() {
	emit('input', null);
}

// Reset cached results when the target collection changes (entity switched).
watch(targetCollection, () => {
	results.value = [];
	search.value = '';
});
</script>

<template>
	<v-skeleton-loader v-if="loading" type="input" />

	<!-- No entity chosen yet → nothing to select against -->
	<v-notice v-else-if="!targetCollection" type="info">
		{{ t('select_an_item') }}
	</v-notice>

	<v-menu v-else attached :disabled="disabled" @update:model-value="(open: boolean) => open && onOpen()">
		<template #activator="{ toggle, active }">
			<div class="prf-field" :class="{ 'prf-field--active': active, 'prf-field--disabled': disabled }" @click="!disabled && toggle()">
				<div class="prf-content">
					<span v-if="hasValue" class="prf-label">{{ text }}</span>
					<span v-else class="prf-placeholder">{{ t('select_an_item') }}</span>
				</div>

				<div class="prf-actions">
					<router-link
						v-if="hasValue && enableLink && route"
						v-tooltip="t('open')"
						:to="route"
						class="prf-action"
						@click.stop
					>
						<v-icon name="launch" />
					</router-link>
					<v-icon
						v-if="hasValue && !disabled"
						v-tooltip="t('deselect')"
						class="prf-action"
						name="close"
						clickable
						@click.stop="deselect"
					/>
					<v-icon class="prf-action prf-chevron" :class="{ 'prf-chevron--active': active }" name="expand_more" />
				</div>
			</div>
		</template>

		<div class="prf-dropdown">
			<div class="prf-search">
				<v-input
					:model-value="search"
					small
					autofocus
					:placeholder="t('search')"
					@update:model-value="onSearch"
				>
					<template #prepend><v-icon name="search" small /></template>
				</v-input>
			</div>

			<v-divider />

			<div class="prf-results">
				<v-progress-linear v-if="resultsLoading" indeterminate />

				<v-list>
					<template v-if="results.length">
						<v-list-item
							v-for="item in results"
							:key="String(item[pkField])"
							clickable
							:active="String(item[pkField]) === String(value)"
							@click="select(item)"
						>
							<v-list-item-content>{{ renderItemLabel(item) }}</v-list-item-content>
						</v-list-item>
					</template>
					<v-list-item v-else-if="!resultsLoading" disabled>
						<v-list-item-content>{{ t('no_items') }}</v-list-item-content>
					</v-list-item>
				</v-list>
			</div>
		</div>
	</v-menu>
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
	cursor: pointer;
	transition: border-color var(--fast, 150ms) var(--transition, ease);
}

.prf-field:hover {
	border-color: var(--theme--form--field--input--border-color-hover);
}

.prf-field--active {
	border-color: var(--theme--primary);
}

.prf-field--disabled {
	cursor: not-allowed;
	background-color: var(--theme--form--field--input--background-subdued);
}

.prf-content {
	flex: 1 1 auto;
	min-width: 0;
	display: flex;
	align-items: center;
}

.prf-label {
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}

.prf-placeholder {
	color: var(--theme--foreground-subdued);
}

.prf-actions {
	flex: 0 0 auto;
	display: flex;
	align-items: center;
	gap: 4px;
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

.prf-chevron {
	transition: transform var(--fast, 150ms) var(--transition, ease);
}

.prf-chevron--active {
	transform: rotate(180deg);
}

.prf-dropdown {
	background-color: var(--theme--background);
}

.prf-search {
	padding: 8px;
}

.prf-results {
	max-height: 260px;
	overflow-y: auto;
}
</style>
