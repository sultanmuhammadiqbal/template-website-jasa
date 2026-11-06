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
- Satu studi kasus contoh untuk Rumah Senja dengan tantangan, pendekatan, dan hasil konsep. Dua kartu lainnya menaut ke contoh format studi kasus yang sama, bukan studi kasus masing-masing.
- Seluruh nama dan deskripsi proyek adalah demonstrasi dan harus diganti sebelum dipakai pada bisnis nyata.
- Pengujian: `npm test` kini menjalankan pemeriksaan HTML/CSS statis, interaksi menu berbasis simulasi DOM, dan cek struktur tahap 2.

## Status

Tahap 1 dan tahap 2 selesai secara implementasi. Navigasi Layanan dan Karya mengarah ke bagian nyata. FAQ masih menuju bagian penanda untuk tahap 3.
