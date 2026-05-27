import { describe, expect, it } from 'vitest';
import {
	buildRoute,
	collectionEndpoint,
	getFieldsFromTemplate,
	referenceEndpoint,
	renderTemplate,
	templateForCollection,
} from './use-reference';

describe('getFieldsFromTemplate', () => {
	it('extracts unique field tokens incl. dotted paths', () => {
		expect(getFieldsFromTemplate('{{ name }} — {{ company.name }} {{name}}')).toEqual(['name', 'company.name']);
	});

	it('returns an empty array for empty/undefined templates', () => {
		expect(getFieldsFromTemplate('')).toEqual([]);
		expect(getFieldsFromTemplate(null)).toEqual([]);
		expect(getFieldsFromTemplate(undefined)).toEqual([]);
	});
});

describe('renderTemplate', () => {
	it('resolves tokens against the item, including nested paths', () => {
		expect(renderTemplate('{{ name }} ({{ meta.sku }})', { name: 'Foo', meta: { sku: 'X1' } })).toBe('Foo (X1)');
	});

	it('renders missing values as empty and trims', () => {
		expect(renderTemplate('{{ a }} {{ b }}', { a: 'only' })).toBe('only');
	});
});

describe('collectionEndpoint', () => {
	it('uses /items for regular collections', () => {
		expect(collectionEndpoint('accounts')).toBe('/items/accounts');
	});

	it('maps system collections to their dedicated endpoint', () => {
		expect(collectionEndpoint('directus_users')).toBe('/users');
	});
});

describe('referenceEndpoint', () => {
	it('appends and encodes the primary key', () => {
		expect(referenceEndpoint('accounts', 'a b')).toBe('/items/accounts/a%20b');
		expect(referenceEndpoint('directus_users', 42)).toBe('/users/42');
	});
});

describe('buildRoute', () => {
	it('links regular collections to the Content module', () => {
		expect(buildRoute('accounts', '7')).toBe('/content/accounts/7');
	});

	it('maps known system collections to their module routes', () => {
		expect(buildRoute('directus_users', 'u1')).toBe('/users/u1');
		expect(buildRoute('directus_files', 'f1')).toBe('/files/f1');
		expect(buildRoute('directus_roles', 'r1')).toBe('/settings/roles/r1');
	});

	it('returns null for system collections without a navigable route', () => {
		expect(buildRoute('directus_policies', 'p1')).toBeNull();
	});
});

describe('templateForCollection', () => {
	const templates = [
		{ collection: 'accounts', template: '{{ name }}' },
		{ collection: 'contacts', template: '{{ first }} {{ last }}' },
	];

	it('returns the matching template', () => {
		expect(templateForCollection(templates, 'contacts')).toBe('{{ first }} {{ last }}');
	});

	it('returns null when nothing matches or inputs are missing', () => {
		expect(templateForCollection(templates, 'unknown')).toBeNull();
		expect(templateForCollection(null, 'accounts')).toBeNull();
		expect(templateForCollection(templates, null)).toBeNull();
	});
});
