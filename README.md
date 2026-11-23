# Muara Kata

*Tempat semua cerita bermuara.*

Satu tempat menulis untuk cerita, puisi, esai, ide, dan tulisan ilmiah. Semua kode ada di satu file `index.html`, tanpa server atau instalasi.

## Terbitkan sebagai website sendiri (GitHub Pages, gratis)

1. Buka **Settings → Pages** di repositori ini.
2. Pada **Build and deployment → Source**, pilih **Deploy from a branch**.
3. Pilih branch `main` dan folder `/ (root)`, lalu klik **Save**.
4. Tunggu 1–2 menit. Website Anda tersedia di **https://muarakata.github.io/**.

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

Penulis mendaftar dan masuk lewat menu ☰ → **Penulis**, lalu mengirim tulisan lewat menu **Kirim Tulisan** dan memantau statusnya di **Tulisan saya**. (Sebelum skrip Apps Script diperbarui, siapa pun bisa mengirim tanpa akun.) Penulis mengirim tulisan tanpa membuat akun. Naskah **tidak tampil** di website sampai pengelola menerimanya di halaman **Tinjau Naskah**.

Naskah masuk disimpan di Google Drive pengelola lewat Google Apps Script (gratis). Cara memasangnya ada di [`apps-script/PANDUAN.md`](apps-script/PANDUAN.md). Menu **Kirim Tulisan** baru muncul setelah kotak masuk disambungkan.

## Fitur

- **Satu tempat menulis.** Tidak ada lagi pemisahan berita dan jurnal. Setiap tulisan punya **kategori** bebas (Cerpen, Puisi, Esai, Opini, Artikel Ilmiah, …), dan kategori itu menjadi tombol saring di beranda.
- **PDF menjadi halaman web.** Saat menulis atau mengirim tulisan, pilih berkas PDF. Teksnya dibaca di browser (PDF.js), lalu judul, subjudul, dan paragrafnya dimasukkan ke kolom isi untuk dirapikan. Pembaca melihat halaman web biasa, bukan berkas PDF.
  - Header, footer, dan nomor halaman dibuang. Kata yang terpenggal di akhir baris disambung lagi, dan tata letak dua kolom dibaca berurutan.
  - Untuk puisi, isi kategori **Puisi** lebih dulu supaya setiap baris tetap terjaga.
  - PDF hasil pindai (berupa gambar) tidak punya teks, jadi isinya perlu diketik.
- Bagian tambahan opsional untuk tulisan ilmiah: afiliasi, kata kunci, dan daftar pustaka.
- Di bawah setiap tulisan ada tombol ikon **suka** (❤️, jumlahnya terlihat semua pembaca) dan **bagikan** (membuka menu bagikan di HP, atau menyalin tautan di komputer). Jumlah suka dihitung oleh Google Apps Script yang sama dengan kotak masuk naskah.
- Format isi: baris kosong = paragraf baru, `## ` = subjudul, `> ` = kutipan, `**tebal**`, `*miring*`.

## Cara lain membuka

- **File langsung:** klik dua kali `index.html`. Dalam mode ini artikel disimpan di browser perangkat itu saja (IndexedDB). Pindahkan ke perangkat lain dengan **Ekspor/Impor cadangan**.
- **Artifact claude.ai:** artikel disimpan di database bersama milik artifact. Hanya pemilik dan editor yang bisa mengunggah.

Cadangan `.json` dari mode file bisa diimpor ke website GitHub (masuk sebagai pengelola → **Impor cadangan**), termasuk PDF dan gambarnya.
