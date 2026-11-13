# Tandeallo — Jurnal & Warta

Website yang memadukan **jurnal ilmiah** dan **berita** dalam satu halaman. Semuanya ada di satu file `index.html`, tanpa server, database, atau instalasi.

## Cara membuka

- **Langsung:** klik dua kali `index.html`, maka halaman terbuka di browser (Chrome, Edge, Firefox, Safari).
- **Online (gratis):** di GitHub buka *Settings → Pages*, pilih branch ini dengan folder `/ (root)`, lalu simpan. Situs akan tersedia di `https://<username>.github.io/Tandeallo/`.

## Fitur

- **Unggah artikel** lewat tombol *+ Unggah Artikel*, dengan dua jenis tulisan:
  - **Berita:** judul, penulis, rubrik, ringkasan, isi, dan gambar sampul.
  - **Jurnal:** ditambah afiliasi, volume/nomor/halaman, DOI, kata kunci, abstrak, daftar pustaka, dan **berkas PDF** naskah lengkap.
- Beranda menampilkan berita utama dan panel *Terbitan Jurnal Terbaru*, diikuti daftar semua artikel.
- Filter Semua / Berita / Jurnal, plus pencarian berdasarkan judul, penulis, dan kata kunci.
- Halaman artikel jurnal punya abstrak, kata kunci, tombol unduh/tampilkan PDF, dan **kutipan APA** yang bisa disalin.
- Artikel bisa diubah dan dihapus.
- Format isi sederhana: baris kosong = paragraf baru, `## ` = subjudul, `> ` = kutipan, `**tebal**`, `*miring*`.

## Penyimpanan data

**Versi online (artifact claude.ai):** artikel disimpan di database bersama milik halaman itu, sedangkan PDF dan gambar sampul disimpan sebagai berkas di server. Semua pengunjung yang punya akses ke link bisa membaca. Hanya pemilik dan editor yang diundang yang melihat tombol *Unggah Artikel*, *Ubah*, dan *Hapus*, dan aturan database menolak penulisan dari orang lain.

**Versi file (`index.html` dibuka langsung atau lewat GitHub Pages):** artikel disimpan di **browser perangkat yang dipakai** (IndexedDB). Artinya:

- Data tetap ada walau browser ditutup, tetapi **tidak otomatis muncul di perangkat atau browser lain**.
- Gunakan **Ekspor cadangan** di bagian bawah halaman untuk menyimpan file `.json`, lalu **Impor cadangan** untuk memulihkannya di perangkat lain.
- Empat artikel bertanda **Contoh** dimuat saat pertama kali dibuka. Hapus saja kalau tidak diperlukan.

