// Direct actor fields; no global audit_logs collection or hook.
const targets = [
	['announcements', true], ['instances', false], ['bookings', true],
	['loan_requests', true], ['print_jobs', false], ['items', false], ['rooms', false]
];

migrate((app) => {
	const users = app.findCollectionByNameOrId('users');
	for (const [name, approval] of targets) {
		let collection;
		try { collection = app.findCollectionByNameOrId(name); } catch (_) { continue; }
		for (const field of ['created_by', 'updated_by']) {
			if (!collection.fields.getByName(field)) collection.fields.add(new RelationField({ name: field, collectionId: users.id, maxSelect: 1, required: false, cascadeDelete: false }));
		}
		if (approval && !collection.fields.getByName('approved_by')) collection.fields.add(new RelationField({ name: 'approved_by', collectionId: users.id, maxSelect: 1, required: false, cascadeDelete: false }));
		if (approval && !collection.fields.getByName('approved_at')) collection.fields.add(new DateField({ name: 'approved_at', required: false }));
		app.save(collection);
	}
}, (app) => {});
