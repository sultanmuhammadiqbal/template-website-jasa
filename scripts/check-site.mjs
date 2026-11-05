import { access, readFile } from "node:fs/promises";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const css = await readFile(new URL("../styles.css", import.meta.url), "utf8");
const js = await readFile(new URL("../script.js", import.meta.url), "utf8");

const checks = [
  ["dokumen memakai bahasa Indonesia", html.includes('<html lang="id">')],
  ["halaman memiliki satu judul utama", (html.match(/<h1\b/g) ?? []).length === 1],
  ["tersedia tautan lewati konten", html.includes('class="skip-link"')],
  ["tombol menu memiliki aria-controls", html.includes('aria-controls="navigasi-utama"')],
  ["konten contoh diberi label demo", /demo|contoh|placeholder/i.test(html)],
  ["gambar hero memiliki dimensi eksplisit", /<img[\s\S]*width="1672"[\s\S]*height="941"/.test(html)],
  ["CSS memiliki breakpoint mobile", css.includes("@media (max-width: 760px)")],
  ["CSS menghormati reduced motion", css.includes("prefers-reduced-motion")],
  ["menu memperbarui aria-expanded", js.includes('setAttribute("aria-expanded"')],
  ["menu dapat ditutup dengan Escape", js.includes('event.key === "Escape"')],
  ["konten belakang menu tidak dapat difokuskan", js.includes("main.inert")],
];

await access(new URL("../assets/images/hero-studio.webp", import.meta.url));

const failed = checks.filter(([, passed]) => !passed);
for (const [label, passed] of checks) {
  console.log(`${passed ? "PASS" : "FAIL"} ${label}`);
}

if (failed.length > 0) {
  process.exitCode = 1;
} else {
  console.log(`\n${checks.length} pemeriksaan lulus; aset hero ditemukan.`);
}
