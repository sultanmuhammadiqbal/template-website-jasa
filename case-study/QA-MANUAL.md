# QA Manual — Ruang Reka Professional Portfolio Case Study

Status: **checklist manual, bukan bukti pemeriksaan telah diselesaikan**. Catat reviewer, browser, tanggal, device, dan hasil sebelum publikasi.

## Visual dan responsivitas

- [ ] Bandingkan screenshot CI 375 px dan 1280 px dengan tampilan aktual Chrome, Firefox dan Safari jika tersedia.
- [ ] Periksa ukuran 320, 375, 768, 1024, 1280 px serta zoom 200%/400%: tidak ada teks tertutup, overflow, atau pemotongan ilustrasi yang mengganggu makna.
- [ ] Pastikan urutan narasi, keterbacaan paragraf panjang, timeline dan perbedaan warna dapat dipahami.
- [ ] Pastikan ilustrasi hero jelas dilabeli sebagai ilustrasi konseptual, bukan screenshot aktual.
- [ ] Periksa semua anchor, tautan PR, dan tautan demo Cloudflare secara manual, termasuk status akses.

## Aksesibilitas manual

- [ ] Navigasi hanya dengan keyboard dari skip-link ke footer; fokus terlihat, berurutan, dan semua anchor bekerja.
- [ ] Uji VoiceOver/NVDA bila tersedia: ilustrasi hero hanya memiliki satu deskripsi ringkas, teks UI dekoratif tidak dibaca satu per satu.
- [ ] Pastikan heading, navigasi, timeline dan angka metrik dipahami tanpa visual CSS.
- [ ] Uji landscape mobile, zoom teks, high contrast/forced colors dan reduced motion.
- [ ] Periksa kontras hover dan fokus; axe otomatis tidak menjamin seluruh WCAG.

## Akurasi klaim dan publikasi

- [ ] Verifikasi ketujuh PR #1–7 merged dan deskripsi tiap milestone sesuai riwayat PR.
- [ ] Bedakan hasil **Lighthouse homepage demo** dari Lighthouse halaman studi kasus; periksa laporan artifact dan catat versi/tanggal pengujian.
- [ ] Pastikan tidak ada klaim hasil klien, persentase kontribusi AI, ROI, atau penghematan waktu tanpa bukti.
- [ ] Review pengaturan noindex,nofollow sebelum mempublikasikan portofolio melalui SEO.
- [ ] Pastikan studi kasus tetap tidak tercakup dalam ZIP pembeli.
- [ ] Hak aset dan lisensi komersial masih **belum diverifikasi**, dan produk bukan rilis siap jual.
- [ ] Periksa hasil deployment Cloudflare secara langsung; CI berhasil bukan bukti deployment selesai.

## Pencatatan QA

Reviewer: ____________________

Tanggal / Browser / Device: ____________________

Temuan dan tindak lanjut: ____________________

Persetujuan publikasi manual: ____________________
