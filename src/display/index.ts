import { defineDisplay } from '@directus/extensions-sdk';
import DisplayComponent from './display.vue';

export default defineDisplay({
	id: 'polymorphic-reference-display',
	name: 'Polymorphic Reference',
	icon: 'merge_type',
	description:
		'Render a polymorphic (collection + id) reference as a navigable, templated link in list/table columns. The target collection is read from a sibling column on the same row.',
	component: DisplayComponent,
	// The value is the id; the collection comes from a sibling column.
	types: ['string', 'uuid', 'integer', 'bigInteger'],
	options: [
		{
			field: 'collectionField',
			name: '$t:collection',
			type: 'string',
			meta: {
				width: 'half',
				interface: 'input',
				note: 'Sibling field on the same row that holds the target collection name (e.g. "entity").',
				options: { placeholder: 'entity' },
			},
			schema: { default_value: 'entity' },
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
								options: { includeSystem: true },
							},
						},
						{
							field: 'template',
							name: '$t:display_template',
							type: 'string',
							meta: {
								width: 'half',
								interface: 'system-display-template',
								options: { collectionField: 'collection' },
							},
						},
					],
				},
			},
		},
	],
});
