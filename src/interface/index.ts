import { defineInterface } from '@directus/extensions-sdk';
import InterfaceComponent from './interface.vue';

export default defineInterface({
	id: 'polymorphic-reference-interface',
	name: 'Polymorphic Reference',
	icon: 'merge_type',
	description:
		'Turn a polymorphic (collection + id) reference into a navigable, templated link. Reads the target collection from a sibling field — like Laravel morphTo.',
	component: InterfaceComponent,
	// Read-only presentation interface: it renders the value, it does not edit it.
	types: ['string', 'uuid', 'integer', 'bigInteger'],
	group: 'relational',
	options: [
		{
			field: 'collectionField',
			name: 'Collection Field',
			type: 'string',
			meta: {
				width: 'half',
				interface: 'input',
				note: 'Name of the sibling field on this item that stores the target collection (e.g. "entity").',
				options: {
					placeholder: 'entity',
				},
			},
			schema: {
				default_value: 'entity',
			},
		},
		{
			field: 'enableLink',
			name: 'Make clickable',
			type: 'boolean',
			meta: {
				width: 'half',
				interface: 'boolean',
				options: {
					label: 'Render as a link to the target record',
				},
			},
			schema: {
				default_value: true,
			},
		},
		{
			field: 'templates',
			name: 'Display Templates per Collection',
			type: 'json',
			meta: {
				width: 'full',
				interface: 'list',
				note: 'For each possible target collection, click together which fields to show. Falls back to the raw ID when no template matches.',
				options: {
					addLabel: 'Add collection template',
					template: '{{ collection }}',
					fields: [
						{
							field: 'collection',
							name: 'Collection',
							type: 'string',
							meta: {
								width: 'half',
								interface: 'system-collection',
								options: {
									includeSystem: true,
								},
							},
						},
						{
							field: 'template',
							name: 'Display Template',
							type: 'string',
							meta: {
								width: 'half',
								interface: 'system-display-template',
								options: {
									// Bind the template editor to the collection chosen in this same row.
									collectionField: 'collection',
								},
							},
						},
					],
				},
			},
		},
	],
});
