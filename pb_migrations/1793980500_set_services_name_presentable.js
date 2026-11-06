/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_863811952");
  const nameField = collection.fields.getByName("name");
  if (nameField) {
    nameField.presentable = true;
    return app.save(collection);
  }
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_863811952");
  const nameField = collection.fields.getByName("name");
  if (nameField) {
    nameField.presentable = false;
    return app.save(collection);
  }
});
