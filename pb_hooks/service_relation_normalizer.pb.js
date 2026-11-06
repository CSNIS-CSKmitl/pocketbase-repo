// Normalizes service slugs (e.g. 'booking', 'printer', 'borrowly', 'initd')
// into their official 'services' collection relation IDs before validation/save.

const SLUG_TO_SERVICE_ID = {
  booking: 'utmqt5k92gmsodh',
  borrowly: '3kzy4o7ckfcrsm9',
  loan: '3kzy4o7ckfcrsm9',
  'borrow-item': '3kzy4o7ckfcrsm9',
  announcements: 'ow2zg8jqdqai2t9',
  announcement: 'ow2zg8jqdqai2t9',
  printer: 'ytan4m3hbzj53zt',
  'printer-server': 'ytan4m3hbzj53zt',
  initd: 'r2e4nkzzi6mae93',
  'init.d': 'r2e4nkzzi6mae93',
  'init-d': 'r2e4nkzzi6mae93',
  csnis: 'i1xjo94dysy434b',
  'csnis-portal': 'i1xjo94dysy434b',
  android: '2cfqpyms90uk8pf',
  'android-app': '2cfqpyms90uk8pf',
  'cskmitl-android-backend': '2cfqpyms90uk8pf',
  jupyterhub: 'nmeunbwtz11fxde',
  'ai-passport': 'pdvl4j8335wuv5h'
};

onRecordCreate((e) => {
  const col = e.record.collection().name;
  const field = col === 'announcement_reads' ? 'site' : 'service';
  const val = e.record.getString(field);
  if (val && SLUG_TO_SERVICE_ID[val.toLowerCase()]) {
    e.record.set(field, SLUG_TO_SERVICE_ID[val.toLowerCase()]);
  }
  e.next();
}, 'admin_actions', 'announcement_reads', 'service_access_logs');
