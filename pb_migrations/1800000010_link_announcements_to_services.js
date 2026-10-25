/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
	const announcementsCol = app.findCollectionByNameOrId('announcements');
	const servicesCol = app.findCollectionByNameOrId('services');

	// 1. Add target_services relation field to announcements if not exists
	if (!announcementsCol.fields.getByName('target_services')) {
		announcementsCol.fields.add(new RelationField({
			name: 'target_services',
			collectionId: servicesCol.id,
			maxSelect: 99,
			required: false
		}));
		app.save(announcementsCol);
		console.log('[Migration] Added target_services relation field to announcements.');
	}

	// 2. Fetch all services to build name/slug to id mapping
	const allServices = app.findRecordsByFilter('services', 'id != ""', 'id', 500, 0);
	const slugToId = {};
	const allServiceIds = [];

	for (const s of allServices) {
		allServiceIds.push(s.id);
		const nameLower = (s.getString('name') || '').toLowerCase();
		if (nameLower.includes('booking')) slugToId['booking'] = s.id;
		else if (nameLower.includes('borrow')) slugToId['borrowly'] = s.id;
		else if (nameLower.includes('init.d') || nameLower.includes('initd')) slugToId['initd'] = s.id;
		else if (nameLower.includes('printer')) slugToId['printer'] = s.id;
		else if (nameLower.includes('csnis')) slugToId['csnis'] = s.id;
		else if (nameLower.includes('android')) slugToId['android'] = s.id;
		else if (nameLower.includes('ai-pass') || nameLower.includes('aipass')) slugToId['aipass'] = s.id;
		else if (nameLower.includes('jupyter')) slugToId['jupyter'] = s.id;
	}

	// 3. Backfill target_services for existing announcements records
	const announcements = app.findRecordsByFilter('announcements', 'id != ""', 'id', 500, 0);
	for (const ann of announcements) {
		let rawTargets = ann.get('targets') || [];
		if (typeof rawTargets === 'string') {
			try { rawTargets = JSON.parse(rawTargets); } catch (_) { rawTargets = [rawTargets]; }
		}

		const mappedIds = [];
		if (rawTargets.includes('all')) {
			for (const sid of allServiceIds) mappedIds.push(sid);
		} else {
			for (const t of rawTargets) {
				if (slugToId[t]) mappedIds.push(slugToId[t]);
			}
		}

		if (mappedIds.length > 0) {
			ann.set('target_services', mappedIds);
			app.save(ann);
		}
	}
	console.log(`[Migration] Backfilled target_services for ${announcements.length} announcements.`);
}, (app) => {
	try {
		const col = app.findCollectionByNameOrId('announcements');
		if (col.fields.getByName('target_services')) {
			col.fields.removeByName('target_services');
			app.save(col);
		}
	} catch (_) {}
});
