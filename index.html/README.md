# Kode lengkap GeneLab — Dari DNA ke Protein

Prototipe pembelajaran SMA: model DNA 3D, transkripsi, pemrosesan RNA, translasi,
tabel 64 kodon, contoh mutasi, dan latihan isian.

## Cara paling mudah

1. Ekstrak seluruh isi ZIP ini.
2. Buka file `GeneLab.html` di Chrome, Edge, atau Firefox.
3. Pilih tahap lalu tekan **Putar proses**, atau gunakan tombol langkah.

`GeneLab.html` sudah memuat seluruh CSS dan JavaScript. Tidak perlu instalasi
library atau koneksi internet untuk fungsi inti. Tautan referensi memerlukan
internet. Dukungan WebGL dan JavaScript perlu diaktifkan; mode gambar 3D
kompatibilitas tersedia jika WebGL tidak didukung.

## Cara mengedit kode

- `dist/index.html`: struktur halaman dan teks antarmuka.
- `dist/styles.css`: warna, tipografi, dan tata letak.
- `dist/biology.js`: urutan DNA/RNA, kode genetik, dan penjelasan.
- `dist/scene.js`: objek dan gerakan molekul.
- `dist/renderer.js`: perender 3D dan kontrol kamera.
- `dist/app.js`: kontrol interaktif dan penghubung antarbagian.
- `tests/genelab.test.js`: 36 pengujian otomatis.

Untuk membuka versi beberapa file, jalankan dari folder ini:

```bash
python -m http.server 8000 --directory dist
```

Kemudian buka http://localhost:8000 di browser. Pada sebagian instalasi Windows,
gunakan `py` sebagai pengganti `python`.

Setelah mengedit berkas di `dist/`, buat ulang versi satu file dengan:

```bash
python build_single.py
```

Atau edit HTML/CSS/JavaScript langsung di `GeneLab.html` dengan editor teks.

## Menjalankan pengujian

Jika Node.js sudah tersedia:

```bash
node --test tests/genelab.test.js
```

Tidak ada dependensi npm yang perlu diinstal. Versi sumber ini berasal dari
prototipe GeneLab yang sama dengan situs yang telah dibuat. 36 pengujian otomatis
lulus pada lingkungan pembuatan; render model diperiksa. Pengujian langsung
browser belum dilakukan di lingkungan pembuatan.

## Catatan pembelajaran

DNA contoh adalah fragmen CDS sepanjang 18 basa, bukan gen lengkap. Pemrosesan
RNA menggunakan contoh intron terpisah yang ditandai pada antarmuka. Skala
molekul dan durasi proses disederhanakan. Kodon stop dikenali faktor pelepas,
bukan ditambahkan sebagai asam amino.

Paket ini tidak menyertakan identitas hosting, kredensial, atau perubahan akses
situs. Tidak ada pengunggahan data dari jawaban latihan; interaksi berlangsung
lokal dalam browser.
