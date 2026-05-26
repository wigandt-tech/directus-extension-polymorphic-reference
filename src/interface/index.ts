import { defineInterface } from '@directus/extensions-sdk';
import InterfaceComponent from './interface.vue';

export default defineInterface({
	id: 'polymorphic-reference-interface',
	name: 'Polymorphic Reference',
	icon: 'merge_type',
	description:
		'Select and navigate a polymorphic (collection + id) reference. The target collection comes from a sibling field (like Laravel morphTo); pick a record from it via a searchable dropdown.',
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
			name: '$t:item_link',
			type: 'boolean',
			meta: {
				width: 'full',
				interface: 'boolean',
				options: {
					label: '$t:show_link_to_item',
				},
			},
			schema: {
				default_value: true,
			},
		},
		{
			field: 'placeholder',
			name: 'Placeholder',
			type: 'string',
			meta: {
				width: 'half',
				interface: 'input',
				options: {
					placeholder: 'Datensatz auswählen…',
				},
			},
		},
		{
			field: 'resultLimit',
			name: 'Result Limit',
			type: 'integer',
			meta: {
				width: 'half',
				interface: 'input',
				note: 'Max number of records loaded into the dropdown per search.',
			},
			schema: {
				default_value: 25,
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
							name: '$t:collection',
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
							name: '$t:display_template',
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
