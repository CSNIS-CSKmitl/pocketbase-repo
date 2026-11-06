/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const services = app.findCollectionByNameOrId("services");

  // 1. admin_actions.service
  try {
    const adminActions = app.findCollectionByNameOrId("admin_actions");
    const adminServiceField = adminActions.fields.getByName("service");
    if (adminServiceField && adminServiceField.type !== "relation") {
      adminActions.fields.removeById(adminServiceField.id);
      adminActions.fields.add(new Field({
        "cascadeDelete": false,
        "collectionId": services.id,
        "help": "",
        "hidden": false,
        "id": "relation3785202386",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "service",
        "presentable": true,
        "required": true,
        "system": false,
        "type": "relation"
      }));
      app.save(adminActions);
    }
  } catch (_) {}

  // 2. announcement_reads.site
  try {
    const reads = app.findCollectionByNameOrId("announcement_reads");
    const siteField = reads.fields.getByName("site");
    if (siteField && siteField.type !== "relation") {
      reads.fields.removeById(siteField.id);
      reads.fields.add(new Field({
        "cascadeDelete": false,
        "collectionId": services.id,
        "help": "",
        "hidden": false,
        "id": "relation1766001124",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "site",
        "presentable": true,
        "required": true,
        "system": false,
        "type": "relation"
      }));
      app.save(reads);
    }
  } catch (_) {}

  // 3. service_access_logs.service
  try {
    const logs = app.findCollectionByNameOrId("service_access_logs");
    const logServiceField = logs.fields.getByName("service");
    if (logServiceField && logServiceField.type !== "relation") {
      logs.fields.removeById(logServiceField.id);
      logs.fields.add(new Field({
        "cascadeDelete": false,
        "collectionId": services.id,
        "help": "",
        "hidden": false,
        "id": "relation3785202386",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "service",
        "presentable": true,
        "required": true,
        "system": false,
        "type": "relation"
      }));
      app.save(logs);
    }
  } catch (_) {}
}, (app) => {});
