import { useApi } from '@directus/extensions-sdk';
import { ref, unref, watch, type Ref } from 'vue';

export interface TemplateEntry {
	collection: string;
	template: string;
}

/**
 * Extract `{{ field.path }}` tokens from a display template.
 */
export function getFieldsFromTemplate(template: string | null | undefined): string[] {
	if (!template) return [];

	const fields: string[] = [];

	for (const match of template.matchAll(/\{\{\s*([\w.]+)\s*\}\}/g)) {
		const key = match[1];
		if (key && !fields.includes(key)) fields.push(key);
	}

	return fields;
}

/**
 * Render a `{{ field }}` template against an item object.
 */
export function renderTemplate(template: string, item: Record<string, unknown>): string {
	return template
		.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_full, path: string) => {
			const value = path
				.split('.')
				.reduce<unknown>((acc, key) => (acc == null ? acc : (acc as Record<string, unknown>)[key]), item);

			return value == null ? '' : String(value);
		})
		.trim();
}

/**
 * REST endpoint to fetch a single record, accounting for Directus system collections
 * that are not served under `/items`.
 */
export function referenceEndpoint(collection: string, primaryKey: string | number): string {
	const id = encodeURIComponent(String(primaryKey));

	if (collection.startsWith('directus_')) {
		return `/${collection.slice('directus_'.length)}/${id}`;
	}

	return `/items/${collection}/${id}`;
}

/**
 * In-app router path to the detail view of a record.
 */
export function buildRoute(collection: string, primaryKey: string | number): string {
	const id = encodeURIComponent(String(primaryKey));

	switch (collection) {
		case 'directus_users':
			return `/users/${id}`;
		case 'directus_files':
			return `/files/${id}`;
		case 'directus_roles':
			return `/settings/roles/${id}`;
		default:
			return `/content/${collection}/${id}`;
	}
}

/**
 * Pick the configured template for a given collection.
 */
export function templateForCollection(
	templates: TemplateEntry[] | null | undefined,
	collection: string | null,
): string | null {
	if (!collection || !Array.isArray(templates)) return null;
	return templates.find((entry) => entry?.collection === collection)?.template ?? null;
}

/**
 * Reactively resolves a polymorphic reference (collection + primaryKey) into a rendered
 * label, fetching only the fields referenced by the template.
 */
export function useReferencePreview(opts: {
	collection: Ref<string | null>;
	primaryKey: Ref<string | number | null>;
	template: Ref<string | null>;
}) {
	const api = useApi();

	const label = ref<string | null>(null);
	const loading = ref(false);
	const error = ref<unknown>(null);

	async function load() {
		const collection = unref(opts.collection);
		const primaryKey = unref(opts.primaryKey);
		const template = unref(opts.template);

		if (!collection || primaryKey == null || primaryKey === '') {
			label.value = null;
			error.value = null;
			return;
		}

		// No template configured → fall back to the raw primary key.
		if (!template) {
			label.value = String(primaryKey);
			error.value = null;
			return;
		}

		const fields = getFieldsFromTemplate(template);

		loading.value = true;
		error.value = null;

		try {
			const res = await api.get(referenceEndpoint(collection, primaryKey), {
				params: fields.length ? { fields: fields.join(',') } : {},
			});

			const item = (res.data?.data ?? {}) as Record<string, unknown>;
			const rendered = renderTemplate(template, item);
			label.value = rendered || String(primaryKey);
		} catch (err) {
			error.value = err;
			// Still show *something* navigable rather than a hard error in a table cell.
			label.value = String(primaryKey);
		} finally {
			loading.value = false;
		}
	}

	watch([opts.collection, opts.primaryKey, opts.template], load, { immediate: true });

	return { label, loading, error };
}
