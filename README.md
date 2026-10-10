# 📅 Kalender OASE — Sinkronisasi Moodle ke Google Calendar

[![Next.js](https://img.shields.io/badge/Next.js-16.4-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Google Calendar API](https://img.shields.io/badge/Google%20Calendar-API%20v3-4285F4?logo=googlecalendar)](https://developers.google.com/calendar)
[![Cloudflare Turnstile](https://img.shields.io/badge/Cloudflare-Turnstile-F38020?logo=cloudflare)](https://www.cloudflare.com/products/turnstile/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Aplikasi web untuk menyinkronkan jadwal perkuliahan, tenggat tugas, kuis, dan ujian dari portal **OASE Moodle Universitas Udayana** ke **Google Calendar** secara praktis, aman, dan otomatis.

---

## Fitur Utama

- **Sinkronisasi Praktis:** Hubungkan akun Google, masukkan akun SSO OASE (NIM & Password), dan jadwal tugas yang belum dikerjakan langsung masuk ke Google Calendar.
- **Filter Tugas Belum Dikerjakan & Penandaan Selesai:** Mengambil tugas aktif langsung dari API Moodle OASE (`core_calendar_get_action_events_by_timesort`). Tugas yang telah dikumpulkan akan otomatis ditandai `✅ [Selesai]` dan alarm pengingatnya dinonaktifkan.
- **Pencegahan Duplikasi (Idempoten):** Mendeteksi agenda yang sudah ada agar tidak terjadi duplikasi, serta memperbarui otomatis jika ada perubahan jadwal atau revisi dari dosen.
- **Pilihan Kalender Fleksibel:**
  - **Kalender Khusus (Disarankan):** Membuat kalender terpisah bernama *"OASE UNUD - Akademik"* agar jadwal kuliah tidak bercampur dengan agenda pribadi.
  - **Kalender Utama (Primary):** Menyinkronkan langsung ke kalender utama akun Google Anda.
  - **Kalender Lainnya:** Memilih kalender Google yang sudah ada di akun Anda.
- **Notifikasi Pengingat:** Opsi alarm pengingat otomatis sebelum batas pengumpulan tugas (24 jam, 2 jam, atau 30 menit sebelumnya).
- **Aman & Stateless:**
  - **Tanpa Database Server:** Tidak menyimpan email, kata sandi, atau data pribadi di database terpusat.
  - **Penyimpanan Lokal Opsional:** Kredensial SSO disimpan di `localStorage` peramban pengguna hanya jika mencentang opsi simpan.
  - **Cookie Terenkripsi:** Menggunakan enkripsi `AES-256-GCM` dengan atribut `HttpOnly`, `SameSite=Lax`, dan `Secure`.
  - **Rate Limiting & Anti-Bot:** Dilengkapi pembatasan request per IP dan verifikasi keamanan Cloudflare Turnstile.
- **Otomatisasi Terjadwal (GitHub Actions):** Mendukung sinkronisasi otomatis di latar belakang tanpa harus membuka web setiap hari.
- **SEO & PWA:** Mendukung metadata dinamis, sitemap XML, Open Graph, dan Progressive Web App (PWA).

---

## Tech Stack

- **Framework:** [Next.js 16.4](https://nextjs.org/) (App Router, Turbopack, Cache Components, Partial Prefetching)
- **UI:** [React 19](https://react.dev/) & [Tailwind CSS v4](https://tailwindcss.com/)
- **Bahasa:** [TypeScript](https://www.typescriptlang.org/)
- **Integrasi API:**
  - [Google APIs Client (`googleapis`)](https://github.com/googleapis/google-api-nodejs-client) — Google Calendar API v3 & OAuth 2.0
  - API Internal Moodle OASE — Endpoint `core_calendar_get_action_events_by_timesort` via SSO Universitas Udayana (OAuth2)
  - [Cloudflare Turnstile](https://challenges.cloudflare.com) — Verifikasi keamanan bot
- **Ikon:** [Lucide React](https://lucide.dev/)
- **Testing:** Node.js Native Test Runner (`node:test`, `node:assert/strict`)

---

## Panduan Instalasi Lokal

### 1. Prasyarat
- **Node.js** versi 20.x atau lebih baru
- Package manager **pnpm** (atau `npm` / `yarn`)

### 2. Kloning Repositori
```bash
git clone https://github.com/oka123/kalender-oase.git
cd kalender-oase
```

### 3. Instal Dependensi
```bash
pnpm install
```

### 4. Konfigurasi Environment Variables
Salin file `.env.example` menjadi `.env.local`:
```bash
cp .env.example .env.local
```

Sesuaikan variabel berikut pada `.env.local`:
```env
# 1. Kredensial SSO OASE Moodle (Opsional untuk default server / Cron otomatis)
OASE_USERNAME="2208561001"
OASE_PASSWORD="password_sso_anda"

# 2. Google OAuth 2.0 (Google Cloud Console)
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
GOOGLE_REDIRECT_URI="http://localhost:3000/api/auth/google/callback"

# 3. Pengaturan Aplikasi
NEXT_PUBLIC_APP_URL="http://localhost:3000"
SESSION_SECRET="kunci-rahasia-acak-minimal-32-karakter"
CRON_SECRET="kunci-rahasia-untuk-cron-endpoint"

# 4. Cloudflare Turnstile
NEXT_PUBLIC_TURNSTILE_SITE_KEY="0x4AAAAAA..."
TURNSTILE_SECRET_KEY="0x4AAAAAA..."
```

Jalankan server pengembangan:
```bash
pnpm dev
```
Buka [http://localhost:3000](http://localhost:3000) di browser.

---

## Konfigurasi Kredensial

### A. Google OAuth 2.0 (Google Cloud Console)
1. Buka [Google Cloud Console](https://console.cloud.google.com/) dan buat proyek baru.
2. Buka **APIs & Services** > **Library**, lalu aktifkan **Google Calendar API**.
3. Buka **OAuth consent screen**:
   - Pilih User Type: **External**.
   - Isi nama aplikasi dan email developer.
   - Tambahkan scopes:
     - `https://www.googleapis.com/auth/calendar.events`
     - `https://www.googleapis.com/auth/calendar`
     - `https://www.googleapis.com/auth/userinfo.email`
     - `https://www.googleapis.com/auth/userinfo.profile`
   - Pada bagian **Test users**, tambahkan email akun Google yang akan digunakan untuk pengujian.
4. Buka **Credentials** > **Create Credentials** > **OAuth client ID**:
   - Application type: **Web application**.
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/google/callback` *(lokal)*
     - `https://domain-anda.vercel.app/api/auth/google/callback` *(produksi)*
5. Masukkan **Client ID** dan **Client Secret** ke file `.env.local`.

---

### B. Cloudflare Turnstile
1. Buka [Cloudflare Dashboard](https://dash.cloudflare.com/) lalu masuk ke menu **Turnstile**.
2. Buat widget baru:
   - **Widget name:** `Kalender OASE`
   - **Hostnames:** Tambahkan `localhost` dan domain produksi Anda.
   - **Widget Mode:** Pilih `Managed`.
3. Masukkan **Site Key** dan **Secret Key** ke `.env.local`.

---

## Alur Kerja Sinkronisasi OASE

1. **Login Akun Google:** Pengguna menghubungkan kalender Google dengan otorisasi OAuth 2.0.
2. **Input Kredensial SSO OASE:** Pengguna memasukkan NIM dan Password SSO Universitas Udayana pada formulir web.
3. **Pemeriksaan Tugas Belum Selesai:** Server menghubungi API Moodle `core_calendar_get_action_events_by_timesort`. API ini hanya mengembalikan tugas yang **belum dikumpulkan** (actionable events).
4. **Sinkronisasi Kalender:**
   - Tugas baru ditambahkan ke Google Calendar dengan detail matakuliah, batas waktu, dan tautan langsung ke tugas.
   - Tugas yang telah dikerjakan (hilang dari API action events) otomatis ditandai `✅ [Selesai]` dan notifikasi pengingatnya dimatikan agar tidak mengganggu.

---

## Otomatisasi Sinkronisasi (GitHub Actions)

Anda dapat mengaktifkan sinkronisasi otomatis menggunakan GitHub Actions gratis:

1. Buka repositori Anda di GitHub > **Settings** > **Secrets and variables** > **Actions**.
2. Tambahkan Repository Secrets:
   - `VERCEL_APP_URL`: URL aplikasi Anda di Vercel (contoh: `https://kalender-oase.vercel.app`)
   - `CRON_SECRET`: Secret token yang sama dengan `CRON_SECRET` di Vercel
3. Pastikan `GOOGLE_REFRESH_TOKEN`, `OASE_USERNAME`, dan `OASE_PASSWORD` sudah disetel di Environment Variables Vercel Dashboard Anda.
4. Workflow di `.github/workflows/sync.yml` akan secara otomatis memicu sinkronisasi ke server Vercel Anda setiap 2 jam sekali tanpa perlu Playwright di runner GitHub.

---

## Pengujian & Kualitas Kode

```bash
# Menjalankan seluruh Unit Tests
pnpm test

# Menjalankan ESLint
pnpm lint

# Membangun build produksi Next.js
pnpm build
```

---

## Penafian (Disclaimer)

- **Bukan Produk Resmi:** Aplikasi ini merupakan proyek independen yang dikembangkan oleh mahasiswa untuk membantu sivitas akademika Universitas Udayana. Aplikasi ini tidak berafiliasi resmi dengan Universitas Udayana maupun Google LLC.
- **Kepatuhan Privasi:** Mematuhi [Google API Services User Data Policy](https://developers.google.com/terms/api-services-user-data-policy). Data pengguna tidak pernah disimpan di database eksternal, tidak dijual kepada pihak ketiga, dan tidak digunakan untuk melatih model AI.

Informasi lebih lanjut dapat dilihat pada halaman [Privacy Policy](/privacy) dan [Terms of Service](/terms).

---

## Lisensi

Didistribusikan di bawah lisensi [MIT](LICENSE).
