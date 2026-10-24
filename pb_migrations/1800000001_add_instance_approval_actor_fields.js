/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
	const users = app.findCollectionByNameOrId('users');
	const instances = app.findCollectionByNameOrId('instances');
	if (!instances.fields.getByName('approved_by')) {
		instances.fields.add(new RelationField({
			name: 'approved_by', collectionId: users.id, maxSelect: 1,
			required: false, cascadeDelete: false, hidden: true
		}));
	}
	if (!instances.fields.getByName('approved_at')) {
		instances.fields.add(new DateField({ name: 'approved_at', required: false, hidden: true }));
	}
	app.save(instances);
}, (app) => {});
