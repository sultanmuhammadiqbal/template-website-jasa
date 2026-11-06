# Template Website Jasa v1.0.0 — Panduan Pembeli

Terima kasih sudah mencoba template website jasa statis berbasis Ruang Reka. Ini adalah **produk kode sumber**, bukan layanan hosting, domain, panel admin dengan login, database, atau CMS. Template menggunakan HTML, CSS, JavaScript, Node.js untuk build, dan Python 3 untuk preview lokal.

## Mulai dalam beberapa langkah

1. Ekstrak ZIP ke folder baru.
2. Jalankan `npm test` dan `npm run build` menggunakan Node.js 20+.
3. Jalankan `npm run dev` (perlu Python 3), buka `http://localhost:4173/configurator/`.
4. Edit nama bisnis, warna, layanan, portofolio, studi kasus, FAQ, dan kontak di editor. Klik **Ekspor JSON**.
5. Salin hasil ekspor bernama `site.json` untuk mengganti `config/site.json` pada proyek hasil ekstraksi. **Simpan cadangan** sebelum menimpa.
6. Jalankan `npm test` dan `npm run build` lagi. Periksa folder `dist/`; **unggah folder `dist/`** ke hosting situs statis.
7. Sebelum menerbitkan situs bisnis asli, selesaikan `CHECKLIST-LAUNCH.md` dan `CONTENT-RIGHTS.md`. Uji juga pada ponsel, keyboard, dan pembaca layar.

**Catatan:** editor tidak menyimpan perubahan otomatis. JSON yang diekspor belum mengubah website sampai diterapkan dan dilakukan build ulang. Preview memaksa kontak nonaktif untuk menghindari pesan tak sengaja.

## Contoh brand kedua

Buka `examples/studio-arunika.site.json`. Semua nama dan proyek pada contoh **fiktif**. Untuk mencoba tanpa mengubah default, buat cadangan `config/site.json`, salin contoh ke sana, kemudian jalankan `npm run build`. Kembalikan file asli setelah mencoba.

## Integritas ZIP dan manifest

ZIP menyertakan `MANIFEST.sha256.json` berisi path, ukuran, dan SHA-256 setiap file sumber. Cocokkan isi ZIP dengan manifest sebelum mendistribusikan ulang. Manifest bukan tanda tangan digital atau bukti hak cipta; periksa identitas pengirim dan sumber unduhan secara terpisah. Dokumen strategi penjualan internal tidak disertakan di ZIP.

## Struktur paket

- `index.html`, `styles.css`, `script.js`: sumber halaman utama.
- `config/site.json`: pengaturan identitas, konten, warna, dan kontak.
- `configurator/`: editor visual (opsional, tanpa autentikasi).
- `scripts/`: renderer, validator, build dan pemeriksaan otomatis.
- `assets/`: aset contoh, **hak penggunaannya wajib diverifikasi**.
- `examples/`: contoh konfigurasi kedua.
- `buyer/`: panduan, checklist, dan draf ketentuan.

## Deployment Cloudflare Pages

Hubungkan repo salinan milik sendiri; build command `npm run build`, output `dist`, root default. Sebelum konten bisnis siap, biarkan `ENABLE_INDEXING` tidak disetel (situs demo memiliki `noindex`). Setelah klaim, konten, legalitas aset, dan kontak valid, atur `SITE_URL=https://domain-asli.example` serta `ENABLE_INDEXING=true` melalui pengaturan environment build. Jangan gunakan domain contoh secara literal.

## Batasan & keamanan

Kontak berupa tautan ke WhatsApp/email, bukan form pengiriman atau CRM. Ilustrasi proyek tersedia dalam tiga gaya CSS: `residence`, `cafe`, `workspace`; hero membutuhkan file WebP yang benar-benar ada di `assets/images/`. Editor dan `config/site.json` bersifat publik ketika seluruh `dist/` dipublikasikan—**jangan memasukkan password, kunci API, atau data rahasia**. Hapus `dist/configurator/` dan `dist/scripts/` pada deployment klien bila editor tidak diperlukan; jangan menghapus `dist/config/contact.js` karena dipakai situs. Perubahan CSS atau jenis ilustrasi baru memerlukan pengembangan tambahan.

**Lisensi:** dokumen `LICENSE-DRAFT.md` adalah usulan ketentuan, **bukan lisensi komersial final**. Penjual harus menyetujui syarat distribusi dan memastikan hak seluruh komponen pihak ketiga sebelum menawarkan produk berbayar.
