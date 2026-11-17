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
  var email = String(req.email || '').trim().slice(0, 200);
  if (!art.title || !art.authors || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { ok: false, error: 'data' };

  var pdf = req.pdf ? decode_(req.pdf, [0x25, 0x50, 0x44, 0x46]) : null; // %PDF
  var cover = req.cover ? decode_(req.cover, [0xFF, 0xD8]) : null;      // JPEG
  if ((req.pdf && !pdf) || (req.cover && !cover)) return { ok: false, error: 'berkas' };
  if (!art.body && !art.abstract && !pdf) return { ok: false, error: 'data' };

  var id = 'n' + new Date().getTime().toString(36) + Math.floor(Math.random() * 1e6).toString(36);
  var folder = folder_();
  var rec = {
    id: id, status: 'menunggu', submitted: new Date().toISOString(), article: art,
    name: String(req.name || '').trim().slice(0, 200), email: email,
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
