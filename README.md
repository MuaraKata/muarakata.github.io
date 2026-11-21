# Muara Kata

*Tempat semua cerita bermuara.*

Website yang memadukan **jurnal ilmiah** dan **berita**. Semua kode ada di satu file `index.html`, tanpa server atau instalasi.

## Terbitkan sebagai website sendiri (GitHub Pages, gratis)

1. Buka **Settings → Pages** di repositori ini.
2. Pada **Build and deployment → Source**, pilih **Deploy from a branch**.
3. Pilih branch `main` dan folder `/ (root)`, lalu klik **Save**.
4. Tunggu 1–2 menit. Website Anda tersedia di **https://wisartandeallo.github.io/Tandeallo/**.

## Mengunggah artikel (pengelola)

Artikel disimpan langsung di repositori ini: teksnya di `content/articles.json`, sedangkan PDF dan gambar sampul di `content/files/`. Karena itu semua pengunjung melihat artikel yang sama.

1. Buka website, lalu klik **Masuk pengelola** di bagian bawah halaman.
2. Buat token di https://github.com/settings/personal-access-tokens/new:
   - **Repository access:** *Only select repositories* → `Tandeallo`
   - **Permissions → Repository permissions → Contents:** *Read and write*
3. Tempel token, klik **Masuk**, lalu gunakan **+ Unggah Artikel**.

### Masuk dengan sandi tetap

Setelah masuk pertama kali dengan token, halaman **Pengelola** menawarkan **Sandi pengelola**. Token GitHub (dan kunci kotak masuk naskah) dikunci dengan sandi itu memakai AES-256 lalu disimpan di `content/config.json`. Setelah itu cukup ketik sandi untuk masuk. Pakai sandi yang kuat, karena versi terkunci token itu bisa dilihat siapa saja di repositori publik. Kalau lupa sandi atau token kedaluwarsa, pilih **Lupa sandi? Masuk dengan token GitHub**, lalu atur sandi baru.

Setiap kali artikel diterbitkan, diubah, atau dihapus, halaman membuat *commit* ke branch `main`. GitHub Pages memperbarui website dalam 1–2 menit. Token hanya disimpan di browser Anda. Klik **Pengelola → Keluar** untuk menghapusnya dari browser itu.

## Kiriman naskah dari pengunjung

Siapa pun bisa mengirim naskah lewat menu **Kirim Naskah** tanpa membuat akun. Naskah **tidak tampil** di website sampai pengelola menerimanya di halaman **Tinjau Naskah**.

Naskah masuk disimpan di Google Drive pengelola lewat Google Apps Script (gratis). Cara memasangnya ada di [`apps-script/PANDUAN.md`](apps-script/PANDUAN.md). Menu **Kirim Naskah** baru muncul setelah kotak masuk disambungkan.

## Fitur

- Dua jenis tulisan:
  - **Berita:** judul, penulis, rubrik, ringkasan, isi, dan gambar sampul.
  - **Jurnal:** ditambah afiliasi, volume/nomor/halaman, DOI, kata kunci, abstrak, daftar pustaka, dan **PDF** naskah lengkap (maks. 20 MB).
- Beranda menampilkan berita utama dan panel *Terbitan Jurnal Terbaru*, diikuti daftar semua artikel.
- Filter Semua / Berita / Jurnal, plus pencarian berdasarkan judul, penulis, dan kata kunci.
- Halaman artikel jurnal punya abstrak, kata kunci, tombol tampilkan/unduh PDF, dan **kutipan APA** yang bisa disalin.
- Format isi: baris kosong = paragraf baru, `## ` = subjudul, `> ` = kutipan, `**tebal**`, `*miring*`.

## Cara lain membuka

- **File langsung:** klik dua kali `index.html`. Dalam mode ini artikel disimpan di browser perangkat itu saja (IndexedDB). Pindahkan ke perangkat lain dengan **Ekspor/Impor cadangan**.
- **Artifact claude.ai:** artikel disimpan di database bersama milik artifact. Hanya pemilik dan editor yang bisa mengunggah.

Cadangan `.json` dari mode file bisa diimpor ke website GitHub (masuk sebagai pengelola → **Impor cadangan**), termasuk PDF dan gambarnya.
