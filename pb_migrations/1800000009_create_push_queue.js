/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
	const usersCol = app.findCollectionByNameOrId('users');

	let pushQueue;
	try {
		pushQueue = app.findCollectionByNameOrId('push_queue');
	} catch (_) {
		pushQueue = new Collection({
			type: 'base',
			name: 'push_queue',
			listRule: '@request.auth.id != ""',
			viewRule: '@request.auth.id != ""',
			createRule: '@request.auth.id != ""',
			updateRule: null,
			deleteRule: null,
			fields: [
				{ type: 'text', name: 'service', max: 64, required: true },
				{ type: 'relation', name: 'user', collectionId: usersCol.id, maxSelect: 1, required: false },
				{ type: 'text', name: 'device_token', max: 512 },
				{ type: 'text', name: 'title', max: 256, required: true },
				{ type: 'text', name: 'body', max: 4096, required: true },
				{ type: 'json', name: 'payload' },
				{ type: 'text', name: 'status', max: 32 },
				{ type: 'text', name: 'error', max: 1024 },
				{ type: 'date', name: 'scheduled_at' },
				{ type: 'date', name: 'sent_at' },
				{ type: 'autodate', name: 'created', onCreate: true, onUpdate: false },
				{ type: 'autodate', name: 'updated', onCreate: true, onUpdate: true }
			],
			indexes: [
				'CREATE INDEX idx_push_queue_status ON push_queue (status)',
				'CREATE INDEX idx_push_queue_service ON push_queue (service)',
				'CREATE INDEX idx_push_queue_user ON push_queue (user)'
			]
		});
		app.save(pushQueue);
		console.log('[Migration] Created push_queue collection.');
	}
}, (app) => {
	try {
		const col = app.findCollectionByNameOrId('push_queue');
		if (col) app.delete(col);
	} catch (_) {}
});
