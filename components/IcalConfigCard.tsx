"use client";

import React, { useState } from "react";
import {
  Link2,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";

interface IcalConfigCardProps {
  hasConfiguredUrl: boolean;
  isCustomUrlActive: boolean;
  onApplyCustomUrl: (url: string) => void;
  onResetToDefault: () => void;
}

export function IcalConfigCard({
  hasConfiguredUrl,
  isCustomUrlActive,
  onApplyCustomUrl,
  onResetToDefault,
}: IcalConfigCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputUrl, setInputUrl] = useState("");
  const [showGuide, setShowGuide] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputUrl.trim()) {
      onApplyCustomUrl(inputUrl.trim());
      setInputUrl("");
      setIsEditing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Link2 className="w-5 h-5 text-[#2c49b6]" />
            <span>Sumber Kalender OASE</span>
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            URL ekspor iCal Moodle UNUD yang digunakan untuk sinkronisasi jadwal
            secara langsung.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowGuide(!showGuide)}
          className="inline-flex items-center gap-1.5 text-sm text-[#005eb8] hover:text-[#001d62] font-semibold self-start sm:self-auto cursor-pointer"
        >
          <HelpCircle className="w-4 h-4" />
          <span>Cara Ambil URL di OASE</span>
          {showGuide ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Accordion Panduan Langkah demi Langkah Sesuai Moodle OASE UNUD */}
      {showGuide && (
        <div className="bg-blue-50/80 border border-blue-200 rounded-lg p-4 text-sm text-slate-700 space-y-3 transition-all">
          <div className="font-bold text-[#001d62] flex items-center justify-between">
            <span className="text-sm">
              Langkah Mendapatkan URL Kalender di OASE UNUD:
            </span>
            <a
              href="https://oase.unud.ac.id/calendar/view.php"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#005eb8] hover:underline inline-flex items-center gap-1 text-sm font-semibold"
            >
              <span>Buka OASE</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 py-1.5 px-2.5 bg-white/80 rounded border border-blue-200/60 font-medium text-slate-800 text-sm">
            <span className="font-semibold text-[#001d62]">
              Sidebar Calendar
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-[#001d62]">
              Import or export calendars
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-[#001d62]">
              Export calendar
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span>Pilih Events to export &amp; Time period</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-bold text-emerald-700">Get Calendar URL</span>
          </div>

          <ol className="list-decimal list-inside space-y-1.5 pl-1 leading-relaxed text-slate-600">
            <li>
              Buka dan login ke situs{" "}
              <a
                href="https://oase.unud.ac.id"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline font-medium"
              >
                OASE UNUD
              </a>
              .
            </li>
            <li>
              Buka menu <strong>Calendar</strong> di sidebar navigasi sebelah
              kiri.
            </li>
            <li>
              Di bagian bawah halaman kalender, klik menu{" "}
              <strong>&quot;Import or export calendars&quot;</strong>.
            </li>
            <li>
              Pilih tab atau tombol <strong>&quot;Export calendar&quot;</strong>
              .
            </li>
            <li>
              Tentukan opsi:
              <ul className="list-disc list-inside pl-4 mt-0.5 space-y-0.5 text-slate-500">
                <li>
                  <strong>Events to export</strong>: Pilih{" "}
                  <em>&quot;All events&quot;</em> atau{" "}
                  <em>&quot;Events related to courses&quot;</em>.
                </li>
                <li>
                  <strong>Time period</strong>: Pilih{" "}
                  <em>&quot;This month&quot;</em> atau{" "}
                  <em>&quot;Recent and next 60 days&quot;</em>.
                </li>
              </ul>
            </li>
            <li>
              Klik tombol <strong>&quot;Get calendar URL&quot;</strong>.
            </li>
            <li>
              Salin URL yang dihasilkan dan tempelkan ke kolom URL kalender di
              aplikasi ini.
            </li>
          </ol>
        </div>
      )}

      {/* Status URL Aman (Privat) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
        <div className="space-y-1.5 min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
              Status Kalender:
            </span>
            {isCustomUrlActive ? (
              <span className="text-sm font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-[#2c49b6] border border-blue-200 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2c49b6]" />
                URL Kustom Aktif
              </span>
            ) : hasConfiguredUrl ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Default Server Terhubung
                </span>
                <span className="text-sm font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-[#001d62] border border-blue-300">
                  Informatika Kelas A Angkatan 2024
                </span>
              </div>
            ) : (
              <span className="text-sm font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                Belum Terkonfigurasi
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Lock className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-slate-600">
              {isCustomUrlActive
                ? "•••••••••••••••••••••••••••••••• (URL Kustom Disimpan di Sesi Anda)"
                : hasConfiguredUrl
                  ? "Kalender default memuat jadwal mata kuliah Informatika Kelas A Angkatan 2024 (URL privat terlindungi di server)."
                  : "Belum ada URL OASE yang dimasukkan"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              setIsEditing(!isEditing);
              setInputUrl("");
            }}
            className="text-sm font-semibold px-4 py-2 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
          >
            {isEditing
              ? "Batal"
              : isCustomUrlActive || hasConfiguredUrl
                ? "Ganti URL"
                : "Masukkan URL"}
          </button>
        </div>
      </div>

      {/* Form Input Custom URL dengan input type password demi keamanan */}
      {isEditing && (
        <form
          onSubmit={handleSave}
          className="space-y-3 pt-2 bg-slate-50/70 p-4 rounded-lg border border-slate-200"
        >
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-1">
              Masukkan URL Kalender iCal OASE Anda:
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="https://oase.unud.ac.id/calendar/export_execute.php?userid=...&authtoken=..."
                className="w-full pr-10 pl-3 py-2 text-sm rounded-md border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-[#2c49b6] font-mono"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                title={showPassword ? "Sembunyikan URL" : "Tampilkan URL"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              URL ini memuat token autentikasi pribadi Anda dan akan disimpan
              secara aman tanpa ditampilkan ke publik.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="text-sm font-semibold px-4 py-2 rounded-md bg-[#005eb8] hover:bg-[#004ba8] text-white transition-colors cursor-pointer"
            >
              Terapkan URL
            </button>
            {isCustomUrlActive && (
              <button
                type="button"
                onClick={() => {
                  onResetToDefault();
                  setIsEditing(false);
                }}
                className="text-sm font-semibold px-4 py-2 rounded-md border border-slate-300 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Kembalikan ke Default
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
