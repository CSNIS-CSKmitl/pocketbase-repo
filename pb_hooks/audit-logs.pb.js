// Database-level audit trail for init.d, Booking, Printer-server, Borrowly,
// Announcements and Android clients.
const AUDITED = new Set(['instances', 'bookings', 'loan_requests', 'print_jobs', 'rooms', 'items', 'announcements']);
const SERVICE = { instances: 'initd', bookings: 'booking', loan_requests: 'borrowly', print_jobs: 'printer-server', rooms: 'booking', items: 'borrowly', announcements: 'announcements' };
const OMIT = new Set(['password', 'passwordConfirm', 'token', 'refreshToken', 'accessToken']);
const SNAPSHOT_FIELDS = {
	instances: ['name', 'status', 'ip', 'type', 'user_id'],
	bookings: ['field', 'date', 'start_time', 'end_time', 'title', 'bookerName', 'bookerEmail', 'booker_id', 'advisorName', 'detailLabel', 'status'],
	loan_requests: ['requester', 'borrowerName', 'email', 'dueDate', 'note', 'teacher', 'caretaker', 'status'],
	print_jobs: ['user', 'file_name', 'status', 'printer', 'copies'],
	rooms: ['name', 'status', 'location'],
	items: ['name', 'status', 'quantity', 'owner'],
	announcements: ['title', 'content', 'status', 'published', 'targets']
};

function snapshot(record) {
	const result = {};
	const names = SNAPSHOT_FIELDS[record.collection().name] || [];
	for (const name of names) {
		if (OMIT.has(name)) continue;
		try { result[name] = record.get(name); } catch (_) { /* ignore unsupported field */ }
	}
	return result;
}

function actorId(event) {
	try { return event.auth?.collectionName === 'users' ? event.auth.id : ''; } catch (_) { return ''; }
}

function writeAudit(event, action, before, after) {
	const name = event.record.collection().name;
	if (!AUDITED.has(name)) return;
	try {
		const collection = event.app.findCollectionByNameOrId('audit_logs');
		const log = new Record(collection);
		const actor = actorId(event);
		const has = (field) => collection.fields.getByName(field) != null;
		if (has('service')) log.set('service', SERVICE[name]);
		if (has('collection')) log.set('collection', name);
		if (has('record_id')) log.set('record_id', event.record.id);
		if (has('action')) log.set('action', action);
		if (actor && has('actor')) log.set('actor', actor);
		if (actor && has('actor_id')) log.set('actor_id', actor);
		if (before && has('before')) log.set('before', before);
		if (after && has('after')) log.set('after', after);
		if (has('metadata')) log.set('metadata', { status: after?.status || before?.status || null });
		event.app.save(log);
	} catch (error) {
		try { event.app.logger().error('Audit log write failed', 'collection', name, 'recordId', event.record.id, 'error', error); } catch (_) { /* audit must never break the source operation */ }
	}
}

onRecordAfterCreateSuccess((e) => { try { writeAudit(e, 'create', null, snapshot(e.record)); } catch (_) { /* fail-open */ } e.next(); });
onRecordAfterUpdateSuccess((e) => {
	try {
		const before = snapshot(e.record.original());
		const after = snapshot(e.record);
		const action = before.status !== after.status ? `status:${before.status || ''}->${after.status || ''}` : 'update';
		writeAudit(e, action, before, after);
	} catch (_) { /* fail-open */ }
	e.next();
});
onRecordAfterDeleteSuccess((e) => { try { writeAudit(e, 'delete', snapshot(e.record), null); } catch (_) { /* fail-open */ } e.next(); });
