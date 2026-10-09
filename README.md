# 📅 Kalender OASE — Sinkronisasi Moodle ke Google Calendar

[![Next.js](https://img.shields.io/badge/Next.js-16.4-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Google Calendar API](https://img.shields.io/badge/Google%20Calendar-API%20v3-4285F4?logo=googlecalendar)](https://developers.google.com/calendar)
[![Cloudflare Turnstile](https://img.shields.io/badge/Cloudflare-Turnstile-F38020?logo=cloudflare)](https://www.cloudflare.com/products/turnstile/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Aplikasi web modern untuk menyinkronkan agenda perkuliahan, tenggat waktu (*deadline*) tugas, kuis, dan jadwal ujian dari portal **OASE Moodle Universitas Udayana** ke **Google Calendar** secara instan, aman, dan otomatis.

---

## 🌟 Fitur Utama

- **⚡ Sinkronisasi Sekali Klik (1-Click Sync):** Hubungkan akun Google, masukkan URL Kalender OASE, dan seluruh jadwal tugas langsung tersusun rapi di Google Calendar.
- **🔄 Smart Idempotent Sync:** Sistem cerdas yang mendeteksi perubahan event secara akurat. Event yang tidak berubah akan otomatis dilewati sehingga tidak ada duplikasi jadwal dan menghemat kuota Google API.
- **📁 Opsi Kalender Fleksibel:**
  - **Kalender Khusus (Rekomendasi):** Otomatis membuat kalender terpisah bernama *"OASE UNUD - Akademik"* agar jadwal kuliah tidak bercampur dengan agenda pribadi.
  - **Kalender Utama (Primary):** Menyinkronkan langsung ke kalender default akun Google.
  - **Kalender Kustom:** Memilih kalender Google lain yang sudah Anda miliki.
- **🔔 Notifikasi Alarm Pengingat (Google Alerts):** Mengatur pengingat otomatis sebelum batas pengumpulan tugas (H-1 / 24 jam, H-2 jam, dan H-30 menit).
- **🔒 Privasi & Keamanan Tingkat Tinggi (Stateless OAuth):**
  - **Tanpa Database Eksternal:** Tidak ada password, email, atau data pribadi pengguna yang disimpan di server.
  - **Cookie Sesi Terenkripsi:** Menggunakan enkripsi HMAC SHA-256 dengan atribut `HttpOnly`, `SameSite=Lax`, dan `Secure`.
  - **SSRF Prevention:** Memvalidasi URL kalender hanya dari domain resmi `*.unud.ac.id` dengan protokol HTTPS.
  - **Perlindungan DDoS & Rate Limiting:** Proteksi *sliding-window* per IP klien serta pembatasan ukuran payload request (<100 KB).
  - **Anti-Bot Cloudflare Turnstile:** Dilengkapi verifikasi cerdas anti-bot tanpa teka-teki membingungkan.
- **🤖 Otomatisasi Sinkronisasi Berkala (GitHub Actions):** Dilengkapi skrip CLI `scripts/sync.ts` yang siap dijalankan secara terjadwal (Cron) tanpa perlu membuka browser.
- **🌐 SEO & PWA Ready:** Mendukung metadata dinamis, Open Graph, schema.org WebApplication JSON-LD, sitemap XML dinamis, dan manifest PWA.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 16.4](https://nextjs.org/) (App Router, Turbopack, Cache Components, Partial Prefetching)
- **Library UI:** [React 19](https://react.dev/)
- **Bahasa:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Integrasi API:**
  - [Google APIs Client Library (`googleapis`)](https://github.com/googleapis/google-api-nodejs-client) — Google Calendar API v3 & OAuth 2.0
  - [node-ical](https://github.com/jens-maus/node-ical) — Parser standar iCalendar (RFC 5545)
  - [Cloudflare Turnstile](https://challenges.cloudflare.com) — Anti-DDoS & Bot Detection
- **Ikon:** [Lucide React](https://lucide.dev/)
- **Manipulasi Waktu:** [date-fns](https://date-fns.org/)
- **Testing:** Node.js Native Test Runner (`node:test`, `node:assert/strict`)

---

## 🚀 Panduan Memulai (Instalasi Lokal)

### 1. Prasyarat
- **Node.js** versi 20.x atau lebih baru
- Package manager **pnpm** (direkomendasikan) atau `npm` / `yarn`

### 2. Kloning Repositori
```bash
git clone https://github.com/oka123/kalender-oase.git
cd kalender-oase
```

### 3. Instalasi Dependensi
```bash
pnpm install
```

### 4. Konfigurasi Environment Variables
Salin file `.env.example` menjadi `.env.local`:
```bash
cp .env.example .env.local
```

Buka `.env.local` dan sesuaikan nilainya:
```env
# 1. Konfigurasi Kalender OASE (Moodle)
OASE_ICAL_URL="https://oase.unud.ac.id/calendar/export_execute.php?userid=...&authtoken=...&preset_what=all&preset_time=custom"

# 2. Google OAuth 2.0 (Google Cloud Console)
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
GOOGLE_REDIRECT_URI="http://localhost:3000/api/auth/google/callback"

# 3. Pengaturan Aplikasi
NEXT_PUBLIC_APP_URL="http://localhost:3000"
SESSION_SECRET="kunci-rahasia-acak-minimal-32-karakter"
CRON_SECRET="kunci-rahasia-untuk-cron-endpoint"

# 4. Cloudflare Turnstile (Gratis)
NEXT_PUBLIC_TURNSTILE_SITE_KEY="0x4AAAAAA..."
TURNSTILE_SECRET_KEY="0x4AAAAAA..."
```

---

## 🔑 Panduan Setup Kredensial

### A. Setup Google OAuth 2.0 (Google Cloud Console)
1. Buka [Google Cloud Console](https://console.cloud.google.com/) dan buat proyek baru.
2. Buka menu **APIs & Services** > **Library**, lalu aktifkan **Google Calendar API**.
3. Buka **OAuth consent screen**:
   - Pilih User Type: **External**.
   - Isi nama aplikasi (misal: *Kalender OASE*) dan email pengembang.
   - Pada bagian **Scopes**, tambahkan scope:
     - `https://www.googleapis.com/auth/calendar.events`
     - `https://www.googleapis.com/auth/calendar`
     - `https://www.googleapis.com/auth/userinfo.email`
     - `https://www.googleapis.com/auth/userinfo.profile`
   - Pada bagian **Test users**, tambahkan email akun Google yang akan Anda gunakan untuk pengujian.
4. Buka **Credentials** > **Create Credentials** > **OAuth client ID**:
   - Application type: **Web application**.
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/google/callback` *(untuk lokal)*
     - `https://domain-anda.vercel.app/api/auth/google/callback` *(untuk produksi)*
5. Simpan **Client ID** dan **Client Secret** ke file `.env.local`.

---

### B. Setup Cloudflare Turnstile (Gratis)
1. Buka [Cloudflare Dashboard](https://dash.cloudflare.com/) lalu masuk ke menu **Turnstile**.
2. Klik **Add widget manually**:
   - **Widget name:** `Kalender OASE`
   - **Hostnames:** Tambahkan `localhost` dan domain produksi Anda (misal `kalender-oase.vercel.app`).
   - **Widget Mode:** Pilih `Managed` (Rekomendasi).
3. Salin **Site Key** ke `NEXT_PUBLIC_TURNSTILE_SITE_KEY` dan **Secret Key** ke `TURNSTILE_SECRET_KEY` di `.env.local`.

---

## 📌 Cara Mengambil URL Kalender OASE (Untuk Mahasiswa)

1. Buka portal [OASE UNUD](https://oase.unud.ac.id/) dan login ke akun Anda.
2. Di menu navigasi samping, klik **Kalender** (*Calendar*).
3. Gulir ke bagian paling bawah halaman kalender, lalu klik tombol **Ekspor Kalender** (*Export calendar*).
4. Pilih opsi:
   - *Acara apa yang diekspor:* **Semua acara** (*All events*)
   - *Periode waktu:* **Rentang waktu khusus** (*Recent and next 60 days* atau *Kustom*)
5. Klik tombol **Ambil URL kalender** (*Get calendar URL*).
6. Salin URL yang dihasilkan (format: `https://oase.unud.ac.id/calendar/export_execute.php?...`) dan masukkan ke dalam aplikasi.

---

## 🔗 Metode Alternatif: Impor Langsung via URL di Google Calendar

Selain menyinkronkan melalui aplikasi web ini, Anda juga dapat menambahkan kalender OASE secara langsung melalui fitur bawaan Google Calendar tanpa memerlukan aplikasi:

### Langkah-Langkah:
1. Dapatkan URL Kalender OASE Anda dari portal OASE (pastikan berawalan `https://`, jika berawalan `webcal://`, ubah menjadi `https://`).
2. Buka [Google Calendar](https://calendar.google.com/) di web browser komputer/laptop.
3. Di panel sebelah kiri, cari bagian **Kalender lain** (*Other calendars*).
4. Klik tanda tambah (**+**) di sebelah kanan *Kalender lain*, lalu pilih **Dari URL** (*From URL*).
5. Tempelkan (*paste*) URL Kalender OASE ke dalam kolom **URL kalender**.
6. Klik **Tambahkan kalender** (*Add calendar*). Google Calendar akan memuat seluruh jadwal kuliah Anda.

### ⚖️ Perbandingan Kedua Metode:

| Fitur / Karakteristik | Aplikasi Web Kalender OASE (Rekomendasi) | Impor Langsung dari URL Google Calendar |
| :--- | :--- | :--- |
| **Kecepatan Pembaruan** | **Instan / Real-Time** (Kapan pun disinkronkan langsung ter-update) | **Tertunda 8–24 Jam** (Google memperbarui kalender eksternal secara acak dan lambat) |
| **Alarm Pengingat (Notifikasi)** | **Otomatis** (Google Alerts H-1 hari, H-2 jam, H-30 menit sebelum batas tugas) | **Tidak Ada** (Google Calendar tidak menyetel notifikasi otomatis pada event feed eksternal) |
| **Format Judul & Deskripsi** | **Rapi & Bersih** (Menghapus "is due", menyertakan nama mata kuliah & tautan langsung ke tugas OASE) | **Teks Mentah** (Menampilkan format bawaan iCal Moodle) |
| **Fleksibilitas Target** | Bisa ke kalender khusus (*"OASE UNUD - Akademik"*), Primary, atau kalender pilihan | Menjadi kalender terpisah bertipe *Read-Only Subscription* |
| **Otomatisasi Latar Belakang** | Mendukung otomatisasi terjadwal via GitHub Actions | Otomatis oleh server Google, namun dengan jeda refresh lama |

---

## 🤖 Otomatisasi Sinkronisasi Berkala (GitHub Actions)

Aplikasi ini dapat menyinkronkan kalender Anda secara otomatis setiap beberapa jam menggunakan GitHub Actions tanpa server berbayar:

1. Buka repositori GitHub Anda > **Settings** > **Secrets and variables** > **Actions**.
2. Tambahkan Repository Secrets berikut:
   - `GOOGLE_CLIENT_ID`: Client ID Google OAuth Anda
   - `GOOGLE_CLIENT_SECRET`: Client Secret Google OAuth Anda
   - `GOOGLE_REFRESH_TOKEN`: Refresh token Google Anda (didapatkan setelah login via web)
   - `OASE_ICAL_URL`: URL ekspor kalender OASE Anda
3. Alur kerja workflow di `.github/workflows/sync.yml` akan secara otomatis menjalankan skrip `pnpm sync:cron` setiap jadwal yang ditentukan.

---

## 🧪 Pengujian & Pemeriksaan Kode

Proyek ini dilengkapi dengan unit test lengkap (14 skenario pengujian) untuk memastikan stabilitas logika kalender dan keamanan:

```bash
# Menjalankan seluruh Unit Tests
pnpm test

# Menjalankan Linter (ESLint)
pnpm lint

# Membangun bundle produksi (Next.js Build)
pnpm build
```

---

## ⚖️ Penafian (Disclaimer) & Privasi

- **Bukan Produk Resmi Universitas Udayana atau Google:** Layanan ini merupakan proyek perangkat lunak utilitas independen yang dikembangkan oleh kontributor mahasiswa untuk membantu civitas akademika. Nama *OASE*, *Universitas Udayana*, dan *Google Calendar* digunakan semata-mata untuk tujuan deskriptif identifikasi sistem.
- **Kepatuhan Privasi:** Aplikasi ini mematuhi [Google API Services User Data Policy](https://developers.google.com/terms/api-services-user-data-policy). Data kalender dan token otentikasi tidak pernah disimpan di database eksternal, tidak dijual kepada pihak ketiga, dan tidak digunakan untuk melatih model kecerdasan buatan (AI).
- Pelajari selengkapnya pada halaman [Kebijakan Privasi](/privacy) dan [Syarat & Ketentuan Layanan](/terms).

---

## 📄 Lisensi

Didistribusikan di bawah Lisensi **MIT**. Lihat `LICENSE` untuk informasi lebih lanjut.
