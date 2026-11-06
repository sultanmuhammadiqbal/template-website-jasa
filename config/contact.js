// Contoh konfigurasi kontak Ruang Reka.
// Semua saluran dinonaktifkan sampai pemilik template memasukkan data bisnis nyata.
// Nomor WhatsApp: format internasional hanya angka, contoh 6281234567890 (tanpa +).
window.RUANG_REKA_CONTACT = Object.freeze({
  whatsapp: {
    enabled: false,
    number: "",
    message: "Halo, saya ingin berkonsultasi tentang desain interior."
  },
  email: {
    enabled: false,
    address: "",
    subject: "Konsultasi desain interior Ruang Reka"
  }
});
