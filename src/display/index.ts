import { defineDisplay } from '@directus/extensions-sdk';
import DisplayComponent from './display.vue';

export default defineDisplay({
	id: 'polymorphic-reference-display',
	name: 'Polymorphic Reference',
	icon: 'merge_type',
	description:
		'Render a self-describing polymorphic value (collection + id) as a navigable, templated link. Use this in list/table columns; for separate collection+id columns use the Polymorphic Reference interface instead.',
	component: DisplayComponent,
	// JSON: { collection, id }. String/uuid: "collection<separator>id".
	types: ['json', 'string', 'uuid'],
	options: [
		{
			field: 'source',
			name: '$t:source',
			type: 'string',
			meta: {
				width: 'full',
				interface: 'select-dropdown',
				note: 'Where the target collection comes from.',
				options: {
					choices: [
						{ text: 'Self-describing value — { collection, id } / collection:id', value: 'value' },
						{ text: 'Sibling field — id column + a separate collection column on the same row', value: 'sibling' },
					],
				},
			},
			schema: {
				default_value: 'value',
			},
		},
		{
			field: 'collectionField',
			name: '$t:collection',
			type: 'string',
			meta: {
				width: 'half',
				interface: 'input',
				note: 'Sibling field on the same row that holds the target collection name (e.g. "entity").',
				options: { placeholder: 'entity' },
				conditions: [{ rule: { source: { _eq: 'value' } }, hidden: true }],
			},
			schema: { default_value: 'entity' },
		},
		{
			field: 'format',
			name: '$t:format',
			type: 'string',
			meta: {
				width: 'half',
				interface: 'select-dropdown',
				options: {
					choices: [
						{ text: 'JSON object — { collection, id }', value: 'json' },
						{ text: 'String — collection<separator>id', value: 'string' },
					],
				},
				conditions: [{ rule: { source: { _eq: 'sibling' } }, hidden: true }],
			},
			schema: {
				default_value: 'json',
			},
		},
		{
			field: 'separator',
			name: 'String Separator',
			type: 'string',
			meta: {
				width: 'half',
				interface: 'input',
				note: 'Only used when Value Format is "String".',
				options: {
					placeholder: ':',
				},
				conditions: [
					{ rule: { format: { _eq: 'string' } }, hidden: false },
					{ rule: { format: { _eq: 'json' } }, hidden: true },
					{ rule: { source: { _eq: 'sibling' } }, hidden: true },
				],
			},
			schema: {
				default_value: ':',
			},
		},
		{
			field: 'collectionKey',
			name: 'Collection Key',
			type: 'string',
			meta: {
				width: 'half',
				interface: 'input',
				note: 'JSON property holding the collection name.',
				options: { placeholder: 'collection' },
				conditions: [
					{ rule: { format: { _eq: 'string' } }, hidden: true },
					{ rule: { source: { _eq: 'sibling' } }, hidden: true },
				],
			},
			schema: { default_value: 'collection' },
		},
		{
			field: 'idKey',
			name: 'ID Key',
			type: 'string',
			meta: {
				width: 'half',
				interface: 'input',
				note: 'JSON property holding the primary key.',
				options: { placeholder: 'id' },
				conditions: [
					{ rule: { format: { _eq: 'string' } }, hidden: true },
					{ rule: { source: { _eq: 'sibling' } }, hidden: true },
				],
			},
			schema: { default_value: 'id' },
		},
		{
			field: 'enableLink',
			name: '$t:item_link',
			type: 'boolean',
			meta: {
				width: 'half',
				interface: 'boolean',
				options: { label: '$t:show_link_to_item' },
			},
			schema: { default_value: true },
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
