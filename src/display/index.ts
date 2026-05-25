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
			field: 'format',
			name: 'Value Format',
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
					{
						rule: { format: { _eq: 'string' } },
						hidden: false,
					},
					{
						rule: { format: { _eq: 'json' } },
						hidden: true,
					},
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
				conditions: [{ rule: { format: { _eq: 'string' } }, hidden: true }],
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
				conditions: [{ rule: { format: { _eq: 'string' } }, hidden: true }],
			},
			schema: { default_value: 'id' },
		},
		{
			field: 'enableLink',
			name: 'Make clickable',
			type: 'boolean',
			meta: {
				width: 'half',
				interface: 'boolean',
				options: { label: 'Render as a link to the target record' },
			},
			schema: { default_value: true },
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
								options: { includeSystem: true },
							},
						},
						{
							field: 'template',
							name: 'Display Template',
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
