/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  try {
    const col = app.findCollectionByNameOrId("audit_logs");
    if (col) {
      app.delete(col);
      console.log("[Migration] Successfully dropped unused audit_logs collection.");
    }
  } catch (err) {
    console.log("[Migration] audit_logs not found or already deleted:", err);
  }
}, (app) => {
  // no-op
});
