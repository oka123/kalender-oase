import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import {
  ShieldCheck,
  Lock,
  ArrowLeft,
  KeyRound,
  EyeOff,
  ExternalLink,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | Kalender OASE",
  description:
    "Kebijakan Privasi untuk aplikasi Kalender OASE Universitas Udayana.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3 group text-slate-800 hover:text-[#001d62] transition-colors"
          >
            <Logo size="md" priority className="border border-slate-200 shadow-2xs" />
            <div>
              <span className="font-bold text-base text-slate-900 block leading-tight">
                Kalender OASE
              </span>
              <span className="text-sm text-slate-500 block leading-tight">
                Universitas Udayana
              </span>
            </div>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#001d62] hover:text-[#2c49b6] bg-slate-100 hover:bg-slate-200/80 px-3.5 py-2 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 flex-1 w-full">
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-6 sm:p-10 space-y-8">
          {/* Header Title */}
          <div className="border-b border-slate-200 pb-6 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-sm font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Privasi & Keamanan Data Pengguna</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Privacy Policy (Kebijakan Privasi)
            </h1>
            <p className="text-sm text-slate-500">
              Terakhir diperbarui: 9 Oktober 2026
            </p>
          </div>

          {/* Section: Pendahuluan */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#001d62]"></span>
              1. Pendahuluan
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Kalender OASE (&quot;Aplikasi&quot;) adalah alat bantu
              independen sumber terbuka (open-source) yang dikembangkan untuk
              membantu sivitas akademika Universitas Udayana menyinkronkan agenda
              perkuliahan, tenggat tugas, kuis, dan ujian dari sistem pembelajaran
              daring OASE Moodle ke Google Calendar pribadi.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              Kami menghargai privasi Anda dan berkomitmen penuh untuk melindungi
              data pribadi Anda. Kebijakan Privasi ini menjelaskan bagaimana
              Aplikasi memproses dan melindungi informasi Anda sejalan dengan
              standar keamanan modern dan Google API Services User Data Policy.
            </p>
          </section>

          {/* Section: Data yang Diakses */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#001d62]"></span>
              2. Data yang Diakses dan Diperlukan
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Untuk menyediakan fungsi sinkronisasi kalender, Aplikasi meminta izin
              otorisasi Google OAuth dengan cakupan (scopes) terbatas berikut:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm text-slate-600 leading-relaxed">
              <li>
                <strong className="text-slate-800">Profil Dasar Google (userinfo.email &amp; userinfo.profile):</strong>{" "}
                Digunakan untuk menampilkan identitas pengguna yang sedang masuk
                (nama, alamat email, dan foto profil) pada antarmuka aplikasi.
              </li>
              <li>
                <strong className="text-slate-800">Google Calendar API (https://www.googleapis.com/auth/calendar.events atau calendar):</strong>{" "}
                Digunakan untuk membuat agenda baru, memperbarui jadwal yang
                berubah, dan memeriksa agenda yang sudah ada agar tidak terjadi
                duplikasi jadwal akademik dari OASE.
              </li>
              <li>
                <strong className="text-slate-800">URL Kalender OASE iCal:</strong>{" "}
                URL feed iCal yang Anda masukkan dari OASE Moodle digunakan oleh
                server semata-mata untuk mengunduh dan mengurai berkas jadwal kuliah
                format iCalendar (.ics).
              </li>
            </ul>
          </section>

          {/* Section: Arsitektur Stateless */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#001d62]"></span>
              3. Penyimpanan Data &amp; Arsitektur Stateless
            </h2>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
                <Lock className="w-4 h-4 text-emerald-600" />
                <span>Tanpa Database Pengguna (Zero-Database Architecture)</span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                Aplikasi ini tidak menyimpan data pribadi Anda di database server
                pusat. Token sesi Google Anda disimpan dalam bentuk Cookie HTTP-only
                yang terenkripsi kuat menggunakan algoritma{" "}
                <span className="font-mono text-slate-800 font-medium">AES-256-GCM</span>{" "}
                di peramban Anda sendiri.
              </p>
              <ul className="list-disc pl-6 space-y-1 text-sm text-slate-600">
                <li>Kami tidak menyimpan kata sandi akun OASE maupun akun Google Anda.</li>
                <li>Kami tidak mengumpulkan log aktivitas personal Anda.</li>
                <li>Ketika Anda menekan tombol Logout, seluruh sesi dan token dihapus seketika dari peramban.</li>
              </ul>
            </div>
          </section>

          {/* Section: Google Limited Use Policy */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#001d62]"></span>
              4. Kepatuhan Kebijakan Penggunaan Terbatas Google (Limited Use)
            </h2>
            <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 sm:p-5 space-y-3">
              <p className="text-sm text-blue-900 leading-relaxed">
                Penggunaan dan transfer informasi yang diterima dari Google API oleh
                Kalender OASE ke aplikasi lain mematuhi{" "}
                <a
                  href="https://developers.google.com/terms/api-services-user-data-policy"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="font-semibold underline hover:text-blue-700 inline-flex items-center gap-1"
                >
                  Google API Services User Data Policy
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                , termasuk persyaratan <strong>Limited Use</strong>:
              </p>
              <ul className="list-disc pl-6 space-y-1.5 text-sm text-blue-800">
                <li>
                  Data Google tidak akan pernah dijual kepada pihak ketiga mana pun.
                </li>
                <li>
                  Data tidak digunakan atau ditransfer untuk tujuan periklanan atau pemasaran.
                </li>
                <li>
                  Data tidak digunakan untuk melatih model kecerdasan buatan umum (AI / LLM).
                </li>
                <li>
                  Akses hanya dilakukan berdasarkan izin eksplisit dari pengguna saat melakukan sinkronisasi.
                </li>
              </ul>
            </div>
          </section>

          {/* Section: Berbagi Data Pihak Ketiga */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#001d62]"></span>
              5. Pengungkapan kepada Pihak Ketiga
            </h2>
            <div className="flex items-start gap-3">
              <EyeOff className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
              <p className="text-sm text-slate-600 leading-relaxed">
                Kami tidak membagikan, memindahtangankan, menyewakan, atau menjual
                informasi pengguna apa pun kepada pihak ketiga. Komunikasi data hanya
                terjadi secara langsung dan terenkripsi melalui HTTPS antara peramban
                Anda, server aplikasi, OASE Moodle UNUD, dan server resmi Google APIs.
              </p>
            </div>
          </section>

          {/* Section: Hak Pengguna & Pencabutan Akses */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#001d62]"></span>
              6. Pencabutan Izin Akses (Revoking Access)
            </h2>
            <div className="flex items-start gap-3">
              <KeyRound className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
              <div className="space-y-2 text-sm text-slate-600 leading-relaxed">
                <p>
                  Anda memiliki kendali penuh atas akun Anda. Anda dapat mencabut izin
                  akses aplikasi ini ke Google Calendar Anda kapan saja dengan cara:
                </p>
                <ol className="list-decimal pl-6 space-y-1">
                  <li>
                    Kunjungi pengaturan izin akun Google Anda di{" "}
                    <a
                      href="https://myaccount.google.com/permissions"
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-[#001d62] font-semibold underline hover:text-[#2c49b6]"
                    >
                      Google Account Security &amp; Permissions
                    </a>
                    .
                  </li>
                  <li>
                    Cari &quot;Kalender OASE&quot; pada daftar aplikasi pihak
                    ketiga.
                  </li>
                  <li>Pilih opsi &quot;Hapus Akses&quot; (Remove Access).</li>
                </ol>
              </div>
            </div>
          </section>

          {/* Section: Kontak */}
          <section className="space-y-3 border-t border-slate-200 pt-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#001d62]"></span>
              7. Hubungi Kami
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Jika Anda memiliki pertanyaan, saran, atau kekhawatiran mengenai
              Kebijakan Privasi ini, silakan hubungi pengelola proyek melalui laman
              resmi repositori GitHub atau saluran kontak akademik terkait.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-500">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            &copy; 2026 Kalender OASE &bull; Universitas Udayana
          </p>
          <div className="flex items-center gap-4 text-sm font-medium">
            <Link href="/" className="hover:text-slate-800">
              Beranda
            </Link>
            <Link href="/terms" className="hover:text-slate-800">
              Terms of Service
            </Link>
            <Link href="/privacy" className="text-[#001d62] font-semibold">
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
