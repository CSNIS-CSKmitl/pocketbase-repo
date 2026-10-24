/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
	const users = app.findCollectionByNameOrId('users');
	for (const name of ['services', 'passion_group']) {
		let collection;
		try { collection = app.findCollectionByNameOrId(name); } catch (_) { continue; }
		for (const field of ['created_by', 'updated_by']) {
			if (!collection.fields.getByName(field)) {
				collection.fields.add(new RelationField({
					name: field, collectionId: users.id, maxSelect: 1,
					required: false, cascadeDelete: false, hidden: true
				}));
			}
		}
		app.save(collection);
	}
}, (app) => {});
