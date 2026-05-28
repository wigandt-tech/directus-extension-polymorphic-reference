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
	options: ({ collection }) => [
		{
			field: 'collectionField',
			name: '$t:collection',
			type: 'string',
			meta: {
				width: 'half',
				interface: 'system-field',
				note: 'Name of the sibling field on this item that stores the target collection (e.g. "entity").',
				options: {
					collectionName: collection,
					typeAllowList: ['string'],
					allowNone: false,
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
			field: 'enableCreate',
			name: 'Create item action',
			type: 'boolean',
			meta: {
				width: 'full',
				interface: 'boolean',
				note: 'Shows a plus action that opens the create form for the currently selected target collection.',
				options: {
					label: 'Show create item action',
				},
			},
			schema: {
				default_value: true,
			},
		},
		{
			field: 'clearOnCollectionChange',
			name: 'Clear on collection change',
			type: 'boolean',
			meta: {
				width: 'full',
				interface: 'boolean',
				note: 'Clears the selected primary key when the sibling collection field changes, preventing stale references to the previous collection.',
				options: {
					label: 'Clear selected item when collection changes',
				},
			},
			schema: {
				default_value: true,
			},
		},
		{
			field: 'templates',
			name: '$t:display_template',
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
		{
			field: 'filters',
			name: '$t:filter',
			type: 'json',
			meta: {
				width: 'full',
				interface: 'list',
				note: 'Optionally restrict which records can be selected, per target collection.',
				options: {
					addLabel: 'Add collection filter',
					template: '{{ collection }}',
					fields: [
						{
							field: 'collection',
							name: '$t:collection',
							type: 'string',
							meta: {
								width: 'half',
								interface: 'system-collection',
								options: { includeSystem: true },
							},
						},
						{
							field: 'filter',
							name: '$t:filter',
							type: 'json',
							meta: {
								width: 'full',
								interface: 'system-filter',
								options: {
									// Bind the filter UI to the collection chosen in this same row.
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
