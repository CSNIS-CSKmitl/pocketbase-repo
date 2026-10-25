/// <reference path="../pb_data/types.d.ts" />

// Central append-only history of admin decisions (approve / reject / delete / cancel / archive)
// across all services. Superuser only: null rules deny every non-superuser request.
migrate((app) => {
	try { app.findCollectionByNameOrId('admin_actions'); return; } catch (_) {}
	const users = app.findCollectionByNameOrId('users');
	const collection = new Collection({
		type: 'base',
		name: 'admin_actions',
		listRule: null, viewRule: null, createRule: null, updateRule: null, deleteRule: null,
		fields: [
			{ type: 'select', name: 'service', required: true, maxSelect: 1, values: ['booking', 'announcement', 'loan', 'printer'] },
			{ type: 'select', name: 'action', required: true, maxSelect: 1, values: ['approve', 'reject', 'delete', 'cancel', 'archive'] },
			{ type: 'relation', name: 'actor', collectionId: users.id, maxSelect: 1, required: false, cascadeDelete: false },
			{ type: 'text', name: 'target_collection', max: 64 },
			{ type: 'text', name: 'target_id', max: 64 },
			{ type: 'text', name: 'target_label', max: 256 },
			{ type: 'json', name: 'metadata', maxSize: 20000 },
			{ type: 'autodate', name: 'created', onCreate: true, onUpdate: false }
		],
		indexes: [
			'CREATE INDEX idx_admin_actions_service_created ON admin_actions (service, created)',
			'CREATE INDEX idx_admin_actions_target ON admin_actions (target_collection, target_id)',
			'CREATE INDEX idx_admin_actions_actor_created ON admin_actions (actor, created)'
		]
	});
	app.save(collection);
}, (app) => {
	try { app.delete(app.findCollectionByNameOrId('admin_actions')); } catch (_) {}
});
