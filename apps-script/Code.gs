/**
 * Tandeallo: kotak masuk naskah.
 *
 * Menerima naskah dari formulir "Kirim Naskah" di website dan menyimpannya
 * di folder Google Drive "Tandeallo - Naskah Masuk". Pengelola meninjau naskah
 * dari halaman "Tinjau Naskah" di website memakai kunci admin.
 *
 * Cara memasang: lihat apps-script/PANDUAN.md.
 */

var FOLDER_NAME = 'Tandeallo - Naskah Masuk';
var MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB per berkas
var MAX_BODY_CHARS = 200000;
var MAX_FIELD_CHARS = 5000;
var ARTICLE_FIELDS = ['type', 'title', 'authors', 'rubrik', 'affiliation', 'abstract', 'body', 'references', 'keywords'];

/** Jalankan sekali dari editor: membuat kunci admin dan folder Drive. */
function setup() {
  var props = PropertiesService.getScriptProperties();
  var key = props.getProperty('ADMIN_KEY');
  if (!key) {
    key = Utilities.getUuid();
    props.setProperty('ADMIN_KEY', key);
  }
  folder_();
  Logger.log('Kunci admin Anda: ' + key);
}

function doGet() {
  return json_({ ok: true, app: 'tandeallo-inbox' });
}

function doPost(e) {
  try {
    var req = JSON.parse(e.postData.contents);
    if (req.action === 'submit') return json_(submit_(req));
    if (req.action === 'like') return json_(like_(req));
    if (req.action === 'likes') return json_(likes_(req));
    if (req.action === 'accounts') return json_({ ok: true, accounts: true });
    if (req.action === 'register') return json_(register_(req));
    if (req.action === 'login') return json_(login_(req));
    if (req.action === 'me') return json_(me_(req));
    if (req.action === 'my_submissions') return json_(mySubmissions_(req));
    if (req.action === 'reset_request') return json_(resetRequest_(req));
    if (req.action === 'reset_confirm') return json_(resetConfirm_(req));

    var key = PropertiesService.getScriptProperties().getProperty('ADMIN_KEY');
    if (!key || req.key !== key) return json_({ ok: false, error: 'kunci' });
    if (req.action === 'list') return json_(list_());
    if (req.action === 'file') return json_(file_(req));
    if (req.action === 'decide') return json_(decide_(req));
    return json_({ ok: false, error: 'aksi' });
  } catch (err) {
    return json_({ ok: false, error: 'server', detail: String(err) });
  }
}

function submit_(req) {
  // Kolom jebakan: manusia tidak melihatnya, bot spam biasanya mengisinya.
  if (req.website) return { ok: true };

  var src = req.article || {};
  var art = {};
  ARTICLE_FIELDS.forEach(function (k) {
    art[k] = String(src[k] || '').trim().slice(0, k === 'body' ? MAX_BODY_CHARS : MAX_FIELD_CHARS);
  });
  if (art.type !== 'jurnal') art.type = 'berita';
  var user = sessionUser_(req.session);
  if (!user) return { ok: false, error: 'sesi' }; // only signed-in writers may send
  var email = user.email;
  if (!art.title || !art.authors) return { ok: false, error: 'data' };

  var pdf = req.pdf ? decode_(req.pdf, [0x25, 0x50, 0x44, 0x46]) : null; // %PDF
  var cover = req.cover ? decode_(req.cover, [0xFF, 0xD8]) : null;      // JPEG
  if ((req.pdf && !pdf) || (req.cover && !cover)) return { ok: false, error: 'berkas' };
  if (!art.body && !art.abstract && !pdf) return { ok: false, error: 'data' };

  var id = 'n' + new Date().getTime().toString(36) + Math.floor(Math.random() * 1e6).toString(36);
  var folder = folder_();
  var rec = {
    id: id, status: 'menunggu', submitted: new Date().toISOString(), article: art,
    name: user.name, email: email, userEmail: email,
    pdfName: '', pdfFileId: '', coverFileId: ''
  };
  if (pdf) {
    rec.pdfFileId = folder.createFile(Utilities.newBlob(pdf, 'application/pdf', id + '.pdf')).getId();
    rec.pdfName = String(req.pdfName || 'naskah.pdf').slice(0, 200);
  }
  if (cover) {
    rec.coverFileId = folder.createFile(Utilities.newBlob(cover, 'image/jpeg', id + '-sampul.jpg')).getId();
  }
  folder.createFile(id + '.json', JSON.stringify(rec), MimeType.PLAIN_TEXT);
  notify_(rec);
  return { ok: true, id: id };
}

/** Base64 -> bytes, or null when too large or the file type does not match. */
function decode_(b64, magic) {
  var bytes = Utilities.base64Decode(String(b64));
  if (bytes.length > MAX_FILE_BYTES || bytes.length < magic.length) return null;
  for (var i = 0; i < magic.length; i++) {
    if ((bytes[i] & 0xFF) !== magic[i]) return null;
  }
  return bytes;
}

/* ---------- Akun penulis ----------
   Accounts live in Script Properties as "user:<email>" with a salted, iterated SHA-256 hash of the
   password (never the password). Sessions are stateless signed tokens (HMAC with a secret kept in
   Script Properties) that carry the email, the account's version and an expiry; changing the
   password bumps the version, which signs out every old session. */
var SESSION_DAYS = 30;
var HASH_ROUNDS = 2000;

function normEmail_(e) { return String(e || '').trim().toLowerCase().slice(0, 200); }
function validEmail_(e) { return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e); }
function getUser_(email) {
  var v = PropertiesService.getScriptProperties().getProperty('user:' + email);
  return v ? JSON.parse(v) : null;
}
function putUser_(u) { PropertiesService.getScriptProperties().setProperty('user:' + u.email, JSON.stringify(u)); }
function b64url_(bytes) { return Utilities.base64EncodeWebSafe(bytes).replace(/=+$/, ''); }
function hash_(salt, pass) {
  var h = salt + ':' + pass;
  for (var i = 0; i < HASH_ROUNDS; i++) h = Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, h + ':' + salt));
  return h;
}
function secret_() {
  var props = PropertiesService.getScriptProperties();
  var s = props.getProperty('SESSION_SECRET');
  if (!s) { s = Utilities.getUuid() + Utilities.getUuid(); props.setProperty('SESSION_SECRET', s); }
  return s;
}
function sign_(payload) { return b64url_(Utilities.computeHmacSha256Signature(payload, secret_())); }
function newSession_(u) {
  var payload = b64url_(Utilities.newBlob(JSON.stringify({ e: u.email, v: u.ver, x: Date.now() + SESSION_DAYS * 864e5 })).getBytes());
  return payload + '.' + sign_(payload);
}
function sessionUser_(token) {
  var parts = String(token || '').split('.');
  if (parts.length !== 2 || sign_(parts[0]) !== parts[1]) return null;
  var data;
  try { data = JSON.parse(Utilities.newBlob(Utilities.base64DecodeWebSafe(parts[0])).getDataAsString()); } catch (e) { return null; }
  if (!data || data.x < Date.now()) return null;
  var u = getUser_(data.e);
  return u && u.ver === data.v ? u : null;
}
function publicUser_(u, withSession) {
  var out = { ok: true, name: u.name, email: u.email };
  if (withSession) out.session = newSession_(u);
  return out;
}
function tooMany_(key, limit) {
  var cache = CacheService.getScriptCache();
  return (parseInt(cache.get(key) || '0', 10) || 0) >= limit;
}
function countFail_(key) {
  var cache = CacheService.getScriptCache();
  cache.put(key, String((parseInt(cache.get(key) || '0', 10) || 0) + 1), 900); // 15 minutes
}

function register_(req) {
  var email = normEmail_(req.email), name = String(req.name || '').trim().slice(0, 120), pass = String(req.password || '');
  if (!name || !validEmail_(email)) return { ok: false, error: 'data' };
  if (pass.length < 8 || pass.length > 200) return { ok: false, error: 'sandi' };
  var lock = LockService.getScriptLock(); lock.waitLock(5000);
  try {
    if (getUser_(email)) return { ok: false, error: 'terdaftar' };
    var salt = Utilities.getUuid();
    var u = { email: email, name: name, salt: salt, hash: hash_(salt, pass), ver: 1, created: new Date().toISOString() };
    putUser_(u);
    return publicUser_(u, true);
  } finally { lock.releaseLock(); }
}

function login_(req) {
  var email = normEmail_(req.email), pass = String(req.password || '');
  if (tooMany_('fail:' + email, 5)) return { ok: false, error: 'terkunci' };
  var u = getUser_(email);
  if (!u || hash_(u.salt, pass) !== u.hash) { countFail_('fail:' + email); return { ok: false, error: 'salah' }; }
  CacheService.getScriptCache().remove('fail:' + email);
  return publicUser_(u, true);
}

function me_(req) {
  var u = sessionUser_(req.session);
  return u ? publicUser_(u, false) : { ok: false, error: 'sesi' };
}

function mySubmissions_(req) {
  var u = sessionUser_(req.session);
  if (!u) return { ok: false, error: 'sesi' };
  var items = [];
  var files = folder_().getFiles();
  while (files.hasNext()) {
    var f = files.next();
    if (!/\.json$/.test(f.getName())) continue;
    var rec = JSON.parse(f.getBlob().getDataAsString());
    if (rec.userEmail !== u.email) continue;
    items.push({ id: rec.id, title: rec.article.title, rubrik: rec.article.rubrik, status: rec.status, submitted: rec.submitted, decided: rec.decided || '' });
  }
  items.sort(function (x, y) { return x.submitted < y.submitted ? 1 : -1; });
  return { ok: true, items: items };
}

function resetRequest_(req) {
  var email = normEmail_(req.email);
  var u = validEmail_(email) ? getUser_(email) : null;
  // Same answer whether or not the account exists, so the form can't be used to discover who has one.
  if (u && !tooMany_('mail:' + email, 3)) {
    var code = String(Math.floor(100000 + Math.random() * 900000));
    CacheService.getScriptCache().put('reset:' + email, code, 900);
    countFail_('mail:' + email);
    try {
      MailApp.sendEmail(email, 'Kode atur ulang sandi Muara Kata',
        'Halo ' + u.name + ',\n\nKode untuk mengatur ulang sandi akun penulis Muara Kata Anda:\n\n    ' + code +
        '\n\nKode ini berlaku 15 menit. Abaikan email ini kalau Anda tidak memintanya.');
    } catch (e) {}
  }
  return { ok: true };
}

function resetConfirm_(req) {
  var email = normEmail_(req.email), pass = String(req.password || '');
  if (pass.length < 8 || pass.length > 200) return { ok: false, error: 'sandi' };
  if (tooMany_('rfail:' + email, 5)) return { ok: false, error: 'terkunci' };
  var cache = CacheService.getScriptCache();
  var code = cache.get('reset:' + email);
  var u = getUser_(email);
  if (!u || !code || String(req.code || '').trim() !== code) { countFail_('rfail:' + email); return { ok: false, error: 'kode' }; }
  cache.remove('reset:' + email);
  u.salt = Utilities.getUuid(); u.hash = hash_(u.salt, pass); u.ver = (u.ver || 1) + 1; // signs out old sessions
  putUser_(u);
  return publicUser_(u, true);
}

/* ---------- Tombol suka: jumlah suka per tulisan, disimpan di Script Properties ---------- */
function likeKey_(id) {
  return /^[A-Za-z0-9_-]{1,80}$/.test(String(id)) ? 'likes:' + id : null;
}

function like_(req) {
  var key = likeKey_(req.id);
  if (!key) return { ok: false, error: 'data' };
  var lock = LockService.getScriptLock();
  lock.waitLock(5000); // two readers liking at once must not overwrite each other
  try {
    var props = PropertiesService.getScriptProperties();
    var n = parseInt(props.getProperty(key) || '0', 10) || 0;
    n = req.undo ? Math.max(0, n - 1) : n + 1;
    props.setProperty(key, String(n));
    return { ok: true, id: String(req.id), likes: n };
  } finally {
    lock.releaseLock();
  }
}

function likes_(req) {
  var ids = Array.isArray(req.ids) ? req.ids.slice(0, 200) : [];
  var props = PropertiesService.getScriptProperties();
  var out = {};
  ids.forEach(function (id) {
    var key = likeKey_(id);
    if (key) out[id] = parseInt(props.getProperty(key) || '0', 10) || 0;
  });
  return { ok: true, likes: out };
}

function list_() {
  var items = [];
  var files = folder_().getFiles();
  while (files.hasNext()) {
    var f = files.next();
    if (!/\.json$/.test(f.getName())) continue;
    var rec = JSON.parse(f.getBlob().getDataAsString());
    if (rec.status === 'menunggu') items.push(rec);
  }
  items.sort(function (x, y) { return x.submitted < y.submitted ? -1 : 1; });
  return { ok: true, items: items };
}

function file_(req) {
  var f = find_(req.id);
  if (!f) return { ok: false, error: 'tidak-ada' };
  var rec = JSON.parse(f.getBlob().getDataAsString());
  var fileId = req.kind === 'cover' ? rec.coverFileId : rec.pdfFileId;
  if (!fileId) return { ok: false, error: 'tidak-ada' };
  var blob = DriveApp.getFileById(fileId).getBlob();
  return { ok: true, b64: Utilities.base64Encode(blob.getBytes()), mime: blob.getContentType(), name: rec.pdfName };
}

function decide_(req) {
  var f = find_(req.id);
  if (!f) return { ok: false, error: 'tidak-ada' };
  var rec = JSON.parse(f.getBlob().getDataAsString());
  rec.status = req.status === 'diterbitkan' ? 'diterbitkan' : 'ditolak';
  rec.decided = new Date().toISOString();
  // Berkas naskah sudah disalin ke GitHub (diterbitkan) atau tidak dipakai lagi (ditolak).
  [rec.pdfFileId, rec.coverFileId].forEach(function (fileId) {
    if (!fileId) return;
    try { DriveApp.getFileById(fileId).setTrashed(true); } catch (e) {}
  });
  f.setContent(JSON.stringify(rec));
  return { ok: true };
}

function find_(id) {
  if (!/^n[a-z0-9]+$/.test(String(id))) return null;
  var files = folder_().getFilesByName(id + '.json');
  return files.hasNext() ? files.next() : null;
}

function notify_(rec) {
  try {
    MailApp.sendEmail(
      Session.getEffectiveUser().getEmail(),
      'Naskah baru: ' + rec.article.title,
      'Ada naskah baru di Tandeallo.\n\n' +
      'Judul: ' + rec.article.title + '\n' +
      'Penulis: ' + rec.article.authors + '\n' +
      'Jenis: ' + rec.article.type + '\n' +
      'Email pengirim: ' + rec.email + '\n\n' +
      'Buka website Anda, masuk sebagai pengelola, lalu buka halaman Tinjau Naskah.'
    );
  } catch (e) {}
}

function folder_() {
  var folders = DriveApp.getFoldersByName(FOLDER_NAME);
  return folders.hasNext() ? folders.next() : DriveApp.createFolder(FOLDER_NAME);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
