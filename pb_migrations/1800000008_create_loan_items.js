/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
	const loanRequests = app.findCollectionByNameOrId('loan_requests');
	const itemsCol = app.findCollectionByNameOrId('items');

	// 1. Create loan_items collection
	let loanItems;
	try {
		loanItems = app.findCollectionByNameOrId('loan_items');
	} catch (_) {
		loanItems = new Collection({
			type: 'base',
			name: 'loan_items',
			listRule: '@request.auth.id != ""',
			viewRule: '@request.auth.id != ""',
			createRule: '@request.auth.id != ""',
			updateRule: '@request.auth.id != ""',
			deleteRule: null,
			fields: [
				{ type: 'relation', name: 'request', collectionId: loanRequests.id, maxSelect: 1, required: true, cascadeDelete: true },
				{ type: 'relation', name: 'item', collectionId: itemsCol.id, maxSelect: 1, required: true },
				{ type: 'number', name: 'quantity', min: 1, required: true },
				{ type: 'text', name: 'status', max: 32 },
				{ type: 'date', name: 'returned_at' },
				{ type: 'autodate', name: 'created', onCreate: true, onUpdate: false },
				{ type: 'autodate', name: 'updated', onCreate: true, onUpdate: true }
			],
			indexes: [
				'CREATE INDEX idx_loan_items_request ON loan_items (request)',
				'CREATE INDEX idx_loan_items_item ON loan_items (item)',
				'CREATE INDEX idx_loan_items_status ON loan_items (status)'
			]
		});
		app.save(loanItems);
		console.log('[Migration] Created loan_items collection.');
	}

	// 2. Backfill existing loan_requests records into loan_items
	const records = app.findRecordsByFilter('loan_requests', 'id != ""', 'id', 500, 0);
	for (const req of records) {
		const reqId = req.id;
		const reqStatus = req.getString('status') || 'pending';
		const returnedAt = req.getString('returnedAt') || '';

		let rawItems = req.get('items') || [];
		if (typeof rawItems === 'string') {
			try { rawItems = JSON.parse(rawItems); } catch (_) { rawItems = [rawItems]; }
		}

		let rawQuantities = req.get('quantities') || {};
		if (typeof rawQuantities === 'string') {
			try { rawQuantities = JSON.parse(rawQuantities); } catch (_) { rawQuantities = {}; }
		}

		for (const itemId of rawItems) {
			if (!itemId) continue;
			let existing;
			try {
				existing = app.findFirstRecordByFilter('loan_items', 'request = {:req} && item = {:item}', {
					req: reqId,
					item: itemId
				});
			} catch (_) {}

			if (!existing) {
				const itemRec = new Record(loanItems);
				itemRec.set('request', reqId);
				itemRec.set('item', itemId);
				const qty = Number(rawQuantities[itemId]) || 1;
				itemRec.set('quantity', qty);
				itemRec.set('status', reqStatus === 'returned' ? 'returned' : 'borrowed');
				if (returnedAt) {
					itemRec.set('returned_at', returnedAt);
				}
				app.save(itemRec);
			}
		}
	}
	console.log(`[Migration] Backfilled loan items for ${records.length} requests.`);
}, (app) => {
	try {
		const col = app.findCollectionByNameOrId('loan_items');
		if (col) app.delete(col);
	} catch (_) {}
});
