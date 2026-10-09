"use client";

import React from "react";
import { CheckCircle2, KeyRound, CalendarCheck, ArrowRight, Layers } from "lucide-react";

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Step 1 */}
        <div
          className={`p-3.5 rounded-lg border transition-all flex flex-col justify-between ${
            isAuthenticated
              ? "bg-emerald-50/40 border-emerald-200"
              : "bg-blue-50/30 border-blue-200"
          }`}
        >
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="w-5 h-5 rounded-full text-xs font-bold bg-[#001d62] text-white flex items-center justify-center">
                1
              </span>
              {isAuthenticated ? (
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Terhubung
                </span>
              ) : (
                <span className="text-xs font-semibold text-[#005eb8] bg-blue-100/70 px-2 py-0.5 rounded-full">
                  Belum Login
                </span>
              )}
            </div>
            <h3 className="text-sm font-bold text-slate-900 pt-1">Hubungkan Google</h3>
            <p className="text-xs text-slate-500">
              Izin akses untuk menambahkan agenda ke Google Calendar.
            </p>
          </div>

          {!isAuthenticated && (
            <div className="pt-2.5">
              <button
                type="button"
                onClick={onLoginClick}
                className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-white bg-[#005eb8] hover:bg-[#004ba8] px-3 py-1.5 rounded-md transition-colors cursor-pointer"
              >
                <KeyRound className="w-3 h-3" />
                <span>Masuk Akun Google</span>
              </button>
            </div>
          )}
        </div>

        {/* Step 2 */}
        <div
          role="button"
          tabIndex={0}
          onClick={onScrollToEvents}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              onScrollToEvents();
            }
          }}
          className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-100/50 transition-all flex flex-col justify-between cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-[#2c49b6]"
        >
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="w-5 h-5 rounded-full text-xs font-bold bg-slate-700 text-white flex items-center justify-center">
                2
              </span>
              <span className="text-xs font-semibold text-slate-700 bg-slate-200/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                <CalendarCheck className="w-3 h-3 text-[#2c49b6]" />
                <span>{eventsCount} Agenda</span>
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 pt-1">Periksa Jadwal</h3>
            <p className="text-xs text-slate-500">
              Tinjau daftar tugas dan kuis dari kalender OASE Moodle.
            </p>
          </div>

          <div className="pt-2.5 flex items-center gap-1 text-xs font-semibold text-[#005eb8] hover:underline">
            <span>Lihat Agenda</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* Step 3 */}
        <div
          role="button"
          tabIndex={0}
          onClick={onScrollToSync}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              onScrollToSync();
            }
          }}
          className={`p-3.5 rounded-lg border transition-all flex flex-col justify-between cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-[#2c49b6] ${
            hasSynced
              ? "bg-emerald-50/40 border-emerald-200"
              : "bg-amber-50/30 border-amber-200"
          }`}
        >
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="w-5 h-5 rounded-full text-xs font-bold bg-amber-600 text-white flex items-center justify-center">
                3
              </span>
              {hasSynced ? (
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Tersinkron
                </span>
              ) : (
                <span className="text-xs font-semibold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full">
                  Siap
                </span>
              )}
            </div>
            <h3 className="text-sm font-bold text-slate-900 pt-1">Sinkronkan</h3>
            <p className="text-xs text-slate-500">
              Pilih alarm dan sinkronkan ke Google Calendar sekali klik.
            </p>
          </div>

          <div className="pt-2.5 flex items-center gap-1 text-xs font-semibold text-[#005eb8] hover:underline">
            <Layers className="w-3 h-3" />
            <span>Atur &amp; Sinkronkan</span>
          </div>
        </div>
      </div>
    </div>
  );
}
