# Template Website Jasa

Fondasi template website bisnis jasa yang ringan dan dapat digunakan ulang. Implementasi tahap pertama memakai bisnis demo **Ruang Reka**, sebuah studio desain interior fiktif. Identitas, alamat email, dan seluruh klaim di halaman adalah contoh, bukan data bisnis nyata.

## Stack

- HTML semantik
- CSS mobile-first tanpa framework
- JavaScript ringan untuk navigasi mobile dan perubahan header
- Tanpa dependensi, backend, database, atau layanan eksternal

## Menjalankan lokal

Prasyarat: Python 3 untuk server lokal dan Node.js 18+ untuk pemeriksaan statis.

```bash
npm run dev
```

Buka `http://localhost:4173`.

## Pemeriksaan

```bash
npm test
```

## Rencana MVP bertahap

1. **Fondasi dan hero responsif**: struktur awal, identitas demo, navigasi, CTA, visual hero lokal, serta aksesibilitas dasar.
2. **Layanan dan portofolio**: daftar layanan, proses kerja, dan studi kasus yang diberi label demo.
3. **FAQ dan kontak**: FAQ interaktif, CTA kontak lengkap, serta konfigurasi tautan WhatsApp/email.
4. **Polish dan audit**: metadata sosial, optimasi aset, audit aksesibilitas dan performa, serta pengujian lintas viewport.

## Konten tahap 2

- Tiga layanan demo: Konsultasi Konsep, Desain Interior, dan Pendampingan Realisasi.
- Tiga proyek fiktif: Rumah Senja, Sudut Kopi, dan Atelier Pagi. Visual bersifat ilustrasi CSS, bukan foto hasil proyek.
- Satu studi kasus contoh untuk Rumah Senja dengan tantangan, pendekatan, dan hasil konsep. Dua kartu lainnya menampilkan keterangan bahwa studi kasus lengkap belum tersedia (tanpa tautan menyesatkan).
- Seluruh nama dan deskripsi proyek adalah demonstrasi dan harus diganti sebelum dipakai pada bisnis nyata.
- Pengujian: `npm test` menjalankan pemeriksaan HTML/CSS statis, interaksi menu berbasis simulasi DOM, dan cek struktur tahap 2. GitHub Actions juga menjalankan Chromium/Playwright untuk tes responsivitas, navigasi mobile, dan kontras hover.

## Konten tahap 3

- FAQ: empat pertanyaan menggunakan elemen HTML `<details>` dan `<summary>`, terbuka melalui klik, Enter, atau Space; tidak memerlukan JavaScript tambahan.
- Kontak: CTA WhatsApp dan email disembunyikan sampai konfigurasi diaktifkan dan alamat divalidasi. Pengunjung tidak diarahkan ke akun contoh yang tidak aktif.
- Navigasi FAQ langsung menuju bagian `#faq`; CTA konsultasi menuju bagian `#kontak`.
- CI: Chromium menguji FAQ via Enter/Space/Tab, overflow, menu mobile, status kontak, dan tautan kontak valid/tidak valid pada lima viewport.
- Semua FAQ, layanan, portofolio, dan kontak adalah contoh; periksa ulang setiap klaim sebelum digunakan klien.

### Mengaktifkan kontak untuk bisnis nyata

Edit berkas `config/contact.js`. Atur `whatsapp.enabled` menjadi `true` dan `whatsapp.number` ke nomor WhatsApp aktif format internasional tanpa `+`, spasi, atau tanda baca (contoh format: `6281234567890`). Atur `email.enabled` menjadi `true` dan `email.address` ke alamat email bisnis yang valid. Isi `message` dan `subject` sesuai kebutuhan. Kedua saluran boleh diaktifkan terpisah; keduanya `false` secara default. Email dibatasi ke alamat ASCII konvensional dan tidak menerima karakter URL seperti `?`, `#`, `%`, spasi, atau baris baru; bila alamat bisnis memakai format internasional yang lebih kompleks, perlu penyesuaian validasi secara teruji. Saat setidaknya satu saluran aktif, pesan status akan berubah tetapi identitas dan konten bisnis tetap dilabeli demo.

> Jangan gunakan data bisnis fiktif atau nomor telepon milik orang lain. Website ini tidak memiliki backend/formulir pengiriman pesan; tombol hanya membuka WhatsApp atau aplikasi email jika telah dikonfigurasi.

Jalankan `npm test` untuk pengujian statis. Browser tests dijalankan di GitHub Actions menggunakan Playwright/Chromium; untuk manual, pasang Playwright yang sesuai, jalankan `npm run dev`, kemudian `node scripts/test-browser.mjs` dan `node scripts/test-stage3-browser.mjs`.

## Status

Tahap 1–3 selesai secara implementasi. Tahap 4 berfokus pada SEO/social metadata, audit aksesibilitas dan performa, serta pengujian visual lanjutan.
