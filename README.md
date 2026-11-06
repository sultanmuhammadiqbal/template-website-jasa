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

## Tahap 4 — production readiness

- SEO dasar: judul, deskripsi, bahasa Indonesia, Open Graph, Twitter card, favicon SVG, dan metadata tema.
- Secara default, demo memakai `noindex, nofollow` agar konten dan bisnis fiktif tidak terindeks sebagai bisnis nyata.
- `npm run build` membuat paket statis di `dist/` termasuk HTML, CSS, JS, dan aset lokal. Tanpa `SITE_URL`, build mempertahankan `noindex` dan tidak memasang canonical/URL gambar sosial yang keliru.
- Untuk deployment publik **setelah konten demo diganti dengan bisnis yang sah**, atur `SITE_URL` ke origin HTTPS sesungguhnya dan `ENABLE_INDEXING=true` secara eksplisit. Contoh perintah memakai alamat uji: `SITE_URL=https://studio.example.org ENABLE_INDEXING=true npm run build`. Ini menghasilkan canonical, `og:url`, `og:image` dan `twitter:image` absolut.
- Jangan mengaktifkan indexing sebelum mengganti identitas, portofolio, FAQ, kontak, dan klaim contoh. Pastikan domain final valid dan HTTPS serta file `/assets/images/hero-studio.webp` tersedia pada URL yang sama.
- `npm test` menguji default `noindex`, pencegahan publikasi tanpa domain, URL absolut, dan aset di `dist/` selain tes lama.
- GitHub Actions menjalankan Playwright pada 320/375/768/1024/1440 piksel, axe-core untuk WCAG 2.0/2.1 A/AA, screenshot setiap viewport, serta laporan Lighthouse. Artefak audit diunggah dari setiap run.
- Lighthouse SEO pada demo lokal tidak mencerminkan kesiapan indexing karena `noindex` disengaja; performa dari CI adalah baseline sintetis, bukan pengganti Core Web Vitals pengguna sungguhan.

### Checklist publikasi

1. Ganti seluruh konten/portofolio ilustratif dengan materi yang punya hak penggunaan; verifikasi hak dan izin foto.
2. Aktifkan kontak valid di `config/contact.js` serta cek pesan status.
3. Konfirmasi domain HTTPS, canonical, gambar share, dan `ENABLE_INDEXING`.
4. Tinjau hasil screenshot & Lighthouse, lalu uji manual keyboard dan screen reader.
5. Pastikan konfigurasi HTTPS, cache/compression, security headers dan 404 dilakukan di penyedia hosting; website ini statis tanpa backend.

## Status

Tahap 1–4 diimplementasikan. Review dan persetujuan merge tahap 4 tetap wajib; demo bukan representasi bisnis sungguhan.
