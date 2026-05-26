import { defineInterface } from '@directus/extensions-sdk';
import CollectionSelect from './collection-select.vue';

export default defineInterface({
	id: 'polymorphic-collection-select',
	name: 'Collection Select',
	icon: 'list_alt',
	description:
		'Dropdown that lists all collections dynamically — store a collection name without maintaining a static choices list. Pairs with the Polymorphic Reference interface.',
	component: CollectionSelect,
	types: ['string'],
	group: 'selection',
	options: [
		{
			field: 'includeSystem',
			name: 'Include system collections',
			type: 'boolean',
			meta: {
				width: 'half',
				interface: 'boolean',
				options: {
					label: 'Show directus_* collections too',
				},
			},
			schema: {
				default_value: false,
			},
		},
		{
			field: 'placeholder',
			name: '$t:placeholder',
			type: 'string',
			meta: {
				width: 'half',
				interface: 'input',
			},
		},
	],
});
