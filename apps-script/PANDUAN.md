# Memasang kotak masuk naskah (sekitar 5 menit)

Dengan kotak masuk ini, siapa pun bisa mengirim naskah lewat menu **Kirim Tulisan** di website tanpa membuat akun. Naskah disimpan di Google Drive Anda dan **tidak tampil** di website sampai Anda menerimanya di halaman **Tinjau Naskah**.

Yang dibutuhkan: akun Google (Gmail) dan akses pengelola website (token GitHub).

## 1. Buat proyek Apps Script

1. Buka https://script.google.com dan masuk dengan akun Google Anda.
2. Klik **Proyek baru**.
3. Klik judul "Proyek tanpa judul" di kiri atas, lalu ganti menjadi **Tandeallo Naskah**.
4. Hapus semua isi file `Code.gs` di editor.
5. Buka file [`Code.gs`](Code.gs) di repositori ini, salin seluruh isinya, lalu tempel ke editor.
6. Klik ikon **Simpan** (💾).

## 2. Buat kunci admin

1. Di toolbar atas, pastikan fungsi yang dipilih adalah **setup**, lalu klik **Jalankan**.
2. Google meminta izin. Klik **Tinjau izin**, pilih akun Anda, lalu:
   - Jika muncul "Google belum memverifikasi aplikasi ini", klik **Lanjutan**, lalu **Buka Tandeallo Naskah (tidak aman)**. Ini normal untuk skrip buatan sendiri.
   - Klik **Izinkan**. Skrip butuh akses Drive (menyimpan naskah) dan Gmail (memberi tahu Anda saat ada naskah baru).
3. Di **Log eksekusi** di bawah, muncul tulisan `Kunci admin Anda: xxxxxxxx-xxxx-...`. **Salin dan simpan kunci ini.** Jangan bagikan ke siapa pun.

## 3. Terbitkan sebagai aplikasi web

1. Klik **Terapkan** (Deploy) di kanan atas, lalu **Penerapan baru**.
2. Klik ikon roda gigi di samping "Pilih jenis", lalu pilih **Aplikasi web**.
3. Isi:
   - **Jalankan sebagai:** *Saya*
   - **Yang memiliki akses:** *Siapa saja* (wajib, agar pengunjung tanpa akun Google bisa mengirim)
4. Klik **Terapkan**, lalu salin **URL aplikasi web** (berakhiran `/exec`).

## 4. Sambungkan ke website

1. Buka website, klik **Masuk pengelola**, lalu masuk dengan token GitHub.
2. Buka menu **Tinjau Naskah**.
3. Di **Pengaturan kotak masuk**, tempel **URL aplikasi web** dan **kunci admin**, lalu klik **Simpan & uji**.
4. Tunggu 1–2 menit sampai GitHub Pages memperbarui website. Menu **Kirim Tulisan** lalu muncul untuk semua pengunjung.

## Sehari-hari

- Saat ada naskah baru, Anda menerima email.
- Buka **Tinjau Naskah** untuk membaca naskah, lalu klik **Terima & terbitkan** atau **Tolak**.
- Naskah yang diterima langsung masuk ke website. Rapikan isinya kapan saja lewat **Ubah tulisan**.
- Berkas naskah yang sudah diputuskan dipindah ke Sampah di Google Drive.

## Tombol suka (❤️)

Skrip yang sama juga menghitung jumlah suka di setiap tulisan. Kalau Anda memasang skrip **sebelum** fitur ini ada, perbarui sekali supaya jumlah suka terlihat oleh semua pembaca:

1. Buka proyek **Tandeallo Naskah** di https://script.google.com.
2. Hapus isi `Code.gs` di editor, lalu tempel isi terbaru dari [`Code.gs`](Code.gs) (di HP: buka https://raw.githubusercontent.com/MuaraKata/muarakata.github.io/main/apps-script/Code.gs, pilih semua, salin). Klik **Simpan**.
3. Klik **Terapkan → Kelola penerapan → ✏️ Edit**, pilih **Versi: Versi baru**, lalu klik **Terapkan**. URL aplikasi web tetap sama.

Sebelum diperbarui, tombol suka tetap bisa diketuk, tetapi hanya tercatat di browser pembaca itu dan angkanya tidak tampil.

## Memperbarui skrip

Jika `Code.gs` di repositori berubah, tempel versi barunya ke editor, lalu klik **Terapkan → Kelola penerapan → ✏️ Edit → Versi: Versi baru → Terapkan**. URL aplikasi web tetap sama, jadi tidak perlu mengubah apa pun di website.

## Catatan

- Batas berkas: 10 MB per PDF.
- Formulir punya perlindungan sederhana dari bot spam. Kalau spam tetap masuk, tolak saja naskahnya.
- Penyimpanan memakai kuota Google Drive Anda (gratis 15 GB).
