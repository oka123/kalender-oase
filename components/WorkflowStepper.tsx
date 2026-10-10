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
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-3.5 sm:p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Step 1 */}
        <div
          className={`p-3 rounded-lg border transition-all flex flex-col justify-between ${
            isAuthenticated
              ? "bg-emerald-50/40 border-emerald-200/80"
              : "bg-slate-50/60 border-slate-200/80"
          }`}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={`w-5 h-5 rounded-full text-sm font-bold flex items-center justify-center shrink-0 ${
                  isAuthenticated
                    ? "bg-emerald-600 text-white"
                    : "bg-[#001d62] text-white"
                }`}
              >
                {isAuthenticated ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  "1"
                )}
              </span>
              <h3 className="text-sm font-bold text-slate-900">
                Hubungkan Google
              </h3>
            </div>
            <p className="text-sm text-slate-500">
              {isAuthenticated
                ? "Akun Google Calendar terhubung."
                : "Masuk untuk memilih kalender tujuan."}
            </p>
          </div>

          {!isAuthenticated ? (
            <div className="pt-2">
              <button
                type="button"
                onClick={onLoginClick}
                className="w-full inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-white bg-[#005eb8] hover:bg-[#004ba8] px-3 py-1.5 rounded-md transition-colors cursor-pointer"
              >
                <KeyRound className="w-3 h-3" />
                <span>Masuk Akun Google</span>
              </button>
            </div>
          ) : (
            <div className="pt-2 text-sm text-emerald-700 font-semibold flex items-center gap-1">
              <span>✓ Terhubung</span>
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
          className="p-3 rounded-lg border border-slate-200/80 bg-slate-50/60 hover:bg-slate-100/60 transition-all flex flex-col justify-between cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-[#005eb8]"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={`w-5 h-5 rounded-full text-sm font-bold flex items-center justify-center shrink-0 ${
                  eventsCount > 0
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-700 text-white"
                }`}
              >
                {eventsCount > 0 ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  "2"
                )}
              </span>
              <h3 className="text-sm font-bold text-slate-900">
                Ambil Tugas OASE
              </h3>
            </div>
            <p className="text-sm text-slate-500">
              {eventsCount > 0
                ? `${eventsCount} tugas aktif siap disinkronkan.`
                : "Masukkan NIM & password SSO Unud."}
            </p>
          </div>

          <div className="pt-2 flex items-center gap-1 text-sm font-semibold text-[#005eb8] hover:underline">
            <span>{eventsCount > 0 ? "Tinjau Tugas" : "Masuk OASE"}</span>
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
          className={`p-3 rounded-lg border transition-all flex flex-col justify-between cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-[#005eb8] ${
            hasSynced
              ? "bg-emerald-50/40 border-emerald-200/80"
              : "bg-slate-50/60 border-slate-200/80 hover:bg-slate-100/60"
          }`}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={`w-5 h-5 rounded-full text-sm font-bold flex items-center justify-center shrink-0 ${
                  hasSynced
                    ? "bg-emerald-600 text-white"
                    : "bg-[#001d62] text-white"
                }`}
              >
                {hasSynced ? <CheckCircle2 className="w-3.5 h-3.5" /> : "3"}
              </span>
              <h3 className="text-sm font-bold text-slate-900">Sinkronkan</h3>
            </div>
            <p className="text-sm text-slate-500">
              {hasSynced
                ? "Tugas telah masuk ke Google Calendar."
                : "Atur alarm dan simpan jadwal."}
            </p>
          </div>

          <div className="pt-2 flex items-center gap-1 text-sm font-semibold text-[#005eb8] hover:underline">
            <Layers className="w-3 h-3" />
            <span>{hasSynced ? "Sinkronkan Lagi" : "Mulai Sinkron"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
