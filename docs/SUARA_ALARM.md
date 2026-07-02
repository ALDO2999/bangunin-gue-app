# Suara Alarm

Taruh file suara alarm di folder ini.

## Aturan penting (Android):
- Nama file **huruf kecil semua**, tanpa spasi, tanpa tanda hubung.
  Gunakan underscore. Contoh: `alarm_default.wav`, `alarm_classic.mp3`
- Format didukung: `.wav`, `.mp3`, `.ogg` (semua sama-sama bisa)
- Ekstensi ikut jadi bagian resource, jadi rujuk TANPA ekstensi di kode.
  Jadi `alarm_default.wav` DAN `alarm_default.mp3` sama-sama dirujuk
  sebagai 'alarm_default'. (Jangan taruh dua file dengan nama sama beda
  ekstensi.)

## File yang diharapkan kode saat ini:
- `alarm_default.wav` (atau .mp3)  ← suara alarm utama (WAJIB untuk sekarang)

Nanti untuk fitur "pilihan suara", tambahkan lagi mis:
- `alarm_classic.mp3`
- `alarm_digital.mp3`
- `alarm_gentle.mp3`

## Sumber suara bebas royalti (gratis):
- https://pixabay.com/sound-effects/search/alarm/  (tanpa atribusi)
- https://mixkit.co/free-sound-effects/alarm/
- https://freesound.org  (cek lisensi CC0)

Setelah menaruh file, jalankan rebuild penuh:
  npm run android
(atau gradlew app:installDebug) — karena file suara ikut ke APK (native).
