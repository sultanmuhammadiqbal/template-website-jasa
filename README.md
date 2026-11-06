# Template Website Jasa

Fondasi template website bisnis jasa yang ringan dan dapat digunakan ulang. Implementasi tahap pertama memakai bisnis demo **Ruang Reka**, sebuah studio desain interior fiktif. Identitas, alamat email, dan seluruh klaim di halaman adalah contoh, bukan data bisnis nyata.

## Stack

- HTML semantik
- CSS mobile-first tanpa framework
- JavaScript ringan untuk navigasi mobile dan konfigurasi kontak yang dihasilkan saat build
- Tanpa dependensi, backend, database, atau layanan eksternal

## Menjalankan lokal

Prasyarat: Python 3 untuk server lokal dan Node.js 18+ untuk pemeriksaan statis.

```bash
npm run dev
```

Buka `http://localhost:4173`. Perintah `npm run dev` membangun lalu menyajikan folder `dist/`, sehingga hasil lokal sama dengan Cloudflare Pages. Setelah mengubah konfigurasi, jalankan ulang perintah untuk melihat hasilnya.

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

Edit berkas `config/site.json` pada objek `contact`. Atur `contact.whatsapp.enabled` menjadi `true` dan `contact.whatsapp.number` ke nomor WhatsApp aktif format internasional tanpa `+`, spasi, atau tanda baca (contoh format: `6281234567890`). Atur `contact.email.enabled` menjadi `true` dan `contact.email.address` ke alamat email bisnis yang valid. Isi `message` dan `subject` sesuai kebutuhan. Kedua saluran boleh diaktifkan terpisah; keduanya `false` secara default. Email dibatasi ke alamat ASCII konvensional dan tidak menerima karakter URL seperti `?`, `#`, `%`, spasi, atau baris baru; bila alamat bisnis memakai format internasional yang lebih kompleks, perlu penyesuaian validasi secara teruji. Saat setidaknya satu saluran aktif, pesan status akan berubah tetapi identitas dan konten bisnis tetap dilabeli demo.

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
2. Aktifkan kontak valid di `config/site.json` serta cek pesan status.
3. Konfirmasi domain HTTPS, canonical, gambar share, dan `ENABLE_INDEXING`.
4. Tinjau hasil screenshot & Lighthouse, lalu uji manual keyboard dan screen reader.
5. Pastikan konfigurasi HTTPS, cache/compression, security headers dan 404 dilakukan di penyedia hosting; website ini statis tanpa backend.

## Fase A1 — Template yang dapat dikonfigurasi

**Satu sumber kebenaran:** `config/site.json`. Tidak perlu mengedit HTML, CSS, atau `config/contact.js` untuk mengganti identitas klien. Berkas `dist/config/contact.js` dihasilkan otomatis saat build dan **jangan diedit langsung**.

Bagian utama:

| Kunci JSON | Apa yang dapat diganti |
|---|---|
| `brand` | Nama usaha, inisial logo, judul/deskripsi SEO, slogan, catatan demo, gambar dan alt hero |
| `theme` | Warna teks, latar, aksen, bagian gelap, layanan, dan FAQ (semua format `#RRGGBB`) |
| `services.items` | Judul, deskripsi, dan tag layanan (1–12 item) |
| `portfolio.items` | Judul, kategori, deskripsi dan ilustrasi CSS proyek (1–12 item) |
| `caseStudy` | Nama proyek, judul, pengantar dan tahapan narasi |
| `faq.items` | Pertanyaan/jawaban (1–12 item) |
| `contact` | Judul, deskripsi, label status, WhatsApp dan email |
| `labels` | Teks tombol, navigasi bagian, status dan petunjuk kontak (termasuk saat saluran aktif) |

### Contoh penggunaan

1. Edit `config/site.json`: ubah `brand.name`, `brand.mark`, `brand.tagline`, dan isi layanan sesuai bisnis.
2. Untuk warna, ubah `theme.accent` dan warna lainnya. Build memeriksa rasio kontras warna utama minimal 4,5:1 dan menolak kombinasi yang tidak aman; tetap periksa seluruh tampilan melalui axe dan evaluasi manual.
3. Portofolio menggunakan ilustrasi `art` yang tersedia: `residence`, `cafe`, atau `workspace`. Buat atau modifikasi CSS jika butuh jenis ilustrasi baru. Set tepat satu `caseStudy: true` untuk kartu yang menaut ke studi kasus, dan pastikan judul kartu sama dengan `caseStudy.name`.
4. Aktifkan kontak valid melalui `contact.whatsapp` dan/atau `contact.email`. Status default tetap nonaktif.
5. Jalankan `npm test`, kemudian `npm run build` dan lihat hasil `dist/`. Untuk pratinjau lokal gunakan `npm run dev`.
6. Di Cloudflare Pages, biarkan build command `npm run build` dan output directory `dist`. Perubahan yang digabungkan ke `main` otomatis membangun ulang website.

**Batasan A1:** konfigurasi adalah JSON yang diedit manual, belum antarmuka admin atau CMS. Nama layanan dan FAQ fleksibel; ilustrasi saat ini memakai tiga gaya CSS yang tersedia. Seluruh kata-kata demo, foto, klaim fiktif, hak gambar, dan label portofolio harus ditinjau ulang sebelum digunakan untuk bisnis nyata. Pengaturan `noindex` pada demo tetap berlaku.

## Fase A2 — Visual Template Configurator

Buka `http://localhost:4173/configurator/` setelah menjalankan `npm run dev`. Configurator tersedia sebagai halaman **terpisah** dari homepage (tanpa tautan navigasi publik) dan tidak mengubah `config/site.json` secara langsung.

- Edit identitas dan SEO, warna, layanan, portofolio, tahapan studi kasus, FAQ, kontak, serta label tombol.
- Tambahkan/hapus item dinamis. Salah satu portofolio harus ditandai sebagai studi kasus; nama studi kasus ikut berubah ketika judul kartu yang terkait diedit.
- Preview langsung merender struktur website menggunakan modul renderer dan validator produksi, dalam iframe sandbox. Mode desktop/mobile tersedia.
- Konfigurasi tidak valid **tidak dapat diekspor**. Validasi memeriksa field wajib, format kontak, ilustrasi, serta pasangan warna WCAG.
- Klik **Ekspor JSON** untuk mengunduh `site.json`. Salin secara manual untuk menggantikan `config/site.json` pada salinan proyek klien, jalankan `npm test` dan `npm run build`.
- Tombol Reset mengembalikan data awal. Perubahan **tidak disimpan otomatis** dan tidak dikirim ke API/GitHub; ekspor terlebih dahulu sebelum meninggalkan halaman.
- Preview memaksa semua tautan kontak nonaktif agar pengujian tidak membuka WhatsApp atau email milik klien. Kontak sebenarnya hanya aktif setelah JSON diekspor, diperiksa, dan di-build.
- Pengaturan gambar hero masih memakai path aset `assets/images/*.webp`; unggah aset yang berlisensi ke repositori klien sebelum memakai path baru.
- Halaman configurator tidak menyediakan autentikasi; jangan menaruh data rahasia atau informasi pribadi di konfigurasi. Untuk deployment klien, hapus `dist/configurator/` apabila tidak ingin mengirim editor ke publik. Ini bukan CMS atau antarmuka yang menyimpan perubahan.

CI menguji layar configurator 375/1280 piksel, audit axe, penggantian brand dan warna, validasi error, dan struktur JSON hasil unduhan.

## Fase A3 — Paket Distribusi Kandidat v1.0.0

Jalankan `python3 scripts/package-template.py` untuk membuat `release/template-website-jasa-v1.0.0.zip`. CI otomatis menjalankan `python3 scripts/test-package.py`, membuka ZIP pada direktori sementara, menjalankan `npm test` dan `npm run build` sebagai pembeli, kemudian membangun contoh brand kedua dari `examples/studio-arunika.site.json`.

ZIP menggunakan allowlist eksplisit dan tidak menyertakan riwayat Git, `.env`, rahasia, dependensi terinstal, CI, atau hasil build. Unduh ZIP sebagai **GitHub Actions artifact** pada PR setelah CI berhasil; bukan rilis berbayar otomatis.

Panduan pembeli, checklist peluncuran, hak penggunaan aset, dan **draf** ketentuan lisensi tersedia di `buyer/` dalam ZIP. **Jangan mendistribusikan untuk penjualan sampai hak gambar hero dan aset lainnya serta syarat lisensi final telah diverifikasi.**

## Status

Tahap 1–4 dan Fase A1 (Template Engine), A2 (Visual Configurator), serta A3 (paket kandidat) sudah digabung ke `main` melalui PR #1–7. Fase B Professional Portfolio Case Study sedang dalam PR #8 dan **belum di-merge**. Demo tidak mewakili bisnis atau klien nyata. Paket A3 belum mendapat izin penjualan karena hak aset dan lisensi final belum diverifikasi.

## Fase B — Professional Portfolio Case Study

Halaman studi kasus portofolio independen tersedia di `/case-study/` setelah menjalankan `npm run build` atau `npm run dev`. Implementasi berada pada `case-study/index.html` dan `case-study/case-study.css`; build menyalinnya sebagai subfolder terpisah dalam `dist/`. Homepage Ruang Reka dan konfigurasi demo tidak diubah.

**Isi yang dapat diverifikasi:** ringkasan masalah, gambaran arsitektur, tujuh tonggak pengembangan dengan tautan PR #1–7, pengembangan berbantuan AI (tanpa mengklaim porsi kontribusi numerik), hasil CI PR #7, dan pembatasan legal produk. Ilustrasi pada hero dibuat dengan CSS dan dilabeli sebagai ilustrasi konseptual, bukan screenshot aktual.

**Quality gate:** `scripts/test-case-study-browser.mjs` menguji viewport 320, 375, 768, 1280 piksel; link internal, keterbacaan layout, larangan indexing, bukti tautan PR, semantik ilustrasi, dan axe WCAG otomatis. Screenshot 375 dan 1280 px diunggah ke GitHub Actions. Lighthouse berjalan terpisah untuk homepage demo dan `/case-study/`; hasilnya diberi label terpisah di log dan artifact CI. Lihat checklist `case-study/QA-MANUAL.md` untuk audit yang tidak dapat digantikan tes otomatis.

**Catatan publikasi:** angka Lighthouse 100/100 yang ditampilkan pada halaman merujuk pada **homepage demo** di CI PR #7; audit khusus `/case-study/` adalah pengukuran terpisah pada CI PR #8. Semua skor adalah pengujian sintetis CI, bukan klaim hasil untuk klien atau jaminan performa setiap lingkungan. Halaman demo dan studi kasus `noindex` secara default. Produk ZIP tetap kandidat: hak aset dan syarat lisensi komersial belum diverifikasi. Halaman bukan representasi proyek klien berbayar.

---
