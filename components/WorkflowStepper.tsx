"use client";

import React from "react";
import { CheckCircle2, KeyRound, CalendarCheck, Sparkles, ArrowRight } from "lucide-react";

interface WorkflowStepperProps {
  isAuthenticated: boolean;
  eventsCount: number;
  hasSynced: boolean;
  onLoginClick: () => void;
  onScrollToSync: () => void;
  onScrollToEvents: () => void;
}

export function WorkflowStepper({
  isAuthenticated,
  eventsCount,
  hasSynced,
  onLoginClick,
  onScrollToSync,
  onScrollToEvents,
}: WorkflowStepperProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Alur Cepat Sinkronisasi (3 Langkah Mudah)</span>
          </h2>
          <p className="text-sm sm:text-sm text-slate-600 mt-0.5">
            Panduan praktis agar seluruh agenda perkuliahan langsung rapi di Google Calendar Anda.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        {/* Step 1 */}
        <div
          className={`relative p-3.5 rounded-lg border transition-all flex flex-col justify-between ${
            isAuthenticated
              ? "bg-emerald-50/50 border-emerald-200 text-emerald-950"
              : "bg-blue-50/40 border-blue-200 text-slate-900"
          }`}
        >
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-sm font-bold bg-[#001d62] text-white">
                1
              </span>
              {isAuthenticated ? (
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Terhubung
                </span>
              ) : (
                <span className="text-sm font-semibold text-[#005eb8] bg-blue-100/70 px-2 py-0.5 rounded-full">
                  Perlu Login
                </span>
              )}
            </div>
            <h3 className="text-sm font-bold pt-1">Hubungkan Google</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Otorisasi izin kalender untuk menambahkan agenda kuliah ke akun Anda.
            </p>
          </div>

          <div className="pt-3">
            {!isAuthenticated && (
              <button
                type="button"
                onClick={onLoginClick}
                className="w-full inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-white bg-[#005eb8] hover:bg-[#004ba8] px-3 py-2 rounded-md transition-colors cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Masuk Sekarang</span>
              </button>
            )}
          </div>
        </div>

        {/* Step 2 */}
        <div
          role="button"
          tabIndex={0}
          onClick={onScrollToEvents}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              onScrollToEvents();
            }
          }}
          className="relative p-3.5 rounded-lg border border-slate-200 bg-slate-50/60 hover:bg-slate-100/60 transition-all flex flex-col justify-between cursor-pointer focus-visible:ring-2 focus-visible:ring-[#2c49b6] outline-none"
        >
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-sm font-bold bg-slate-700 text-white">
                2
              </span>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-slate-700 bg-slate-200/80 px-2 py-0.5 rounded-full">
                <CalendarCheck className="w-3.5 h-3.5 text-[#2c49b6]" />
                <span>{eventsCount} Terdeteksi</span>
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 pt-1">Cek Jadwal OASE</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Pastikan daftar jadwal perkuliahan dari Moodle sudah sesuai akun Anda.
            </p>
          </div>

          <div className="pt-3">
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#005eb8] hover:underline">
              <span>Lihat Daftar Kegiatan</span>
              <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Step 3 */}
        <div
          role="button"
          tabIndex={0}
          onClick={onScrollToSync}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              onScrollToSync();
            }
          }}
          className={`relative p-3.5 rounded-lg border transition-all flex flex-col justify-between cursor-pointer focus-visible:ring-2 focus-visible:ring-[#2c49b6] outline-none ${
            hasSynced
              ? "bg-emerald-50/60 border-emerald-200 text-emerald-950"
              : "bg-amber-50/40 border-amber-200 text-slate-900"
          }`}
        >
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-sm font-bold bg-amber-600 text-white">
                3
              </span>
              {hasSynced ? (
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Sudah Sinkron
                </span>
              ) : (
                <span className="text-sm font-semibold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full">
                  Siap Sinkron
                </span>
              )}
            </div>
            <h3 className="text-sm font-bold pt-1">Sinkronkan Sekali Klik</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Pilih pengingat alarm (H-1, H-2 jam) dan masukkan kegiatan ke kalender Google.
            </p>
          </div>

          <div className="pt-3">
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-amber-800 hover:underline">
              <span>Buka Kontrol Sinkronisasi</span>
              <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
