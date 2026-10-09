"use client";

import { CheckCircle2, KeyRound, ArrowRight, Layers } from "lucide-react";

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
              ? "bg-emerald-50/30 border-emerald-200/80"
              : "bg-slate-50/60 border-slate-200"
          }`}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={`w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${
                  isAuthenticated
                    ? "bg-emerald-600 text-white"
                    : "bg-[#001d62] text-white"
                }`}
              >
                {isAuthenticated ? <CheckCircle2 className="w-3.5 h-3.5" /> : "1"}
              </span>
              <h3 className="text-sm font-bold text-slate-900">
                Hubungkan Google
              </h3>
            </div>
            <p className="text-xs text-slate-500 pt-0.5">
              {isAuthenticated
                ? "Akun Google Calendar telah terhubung."
                : "Izin akses untuk menambahkan agenda ke Google Calendar."}
            </p>
          </div>

          {!isAuthenticated ? (
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
          ) : (
            <div className="pt-2.5 text-xs text-emerald-700 font-medium">
              ✓ Siap digunakan
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
          className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/60 hover:bg-slate-100/60 transition-all flex flex-col justify-between cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-[#2c49b6]"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full text-xs font-bold bg-slate-700 text-white flex items-center justify-center shrink-0">
                2
              </span>
              <h3 className="text-sm font-bold text-slate-900">
                Periksa Jadwal
              </h3>
            </div>
            <p className="text-xs text-slate-500 pt-0.5">
              {eventsCount > 0
                ? `${eventsCount} agenda ditemukan dari kalender.`
                : "Tinjau daftar tugas dan kuis dari kalender OASE Moodle."}
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
              ? "bg-emerald-50/30 border-emerald-200/80"
              : "bg-slate-50/60 border-slate-200 hover:bg-slate-100/60"
          }`}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={`w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${
                  hasSynced
                    ? "bg-emerald-600 text-white"
                    : "bg-[#001d62] text-white"
                }`}
              >
                {hasSynced ? <CheckCircle2 className="w-3.5 h-3.5" /> : "3"}
              </span>
              <h3 className="text-sm font-bold text-slate-900">
                Sinkronkan
              </h3>
            </div>
            <p className="text-xs text-slate-500 pt-0.5">
              {hasSynced
                ? "Agenda telah disinkronkan ke Google Calendar."
                : "Pilih alarm dan sinkronkan ke Google Calendar."}
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
