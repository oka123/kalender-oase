"use client";

import React, { useState } from "react";
import {
  Calendar,
  RefreshCw,
  Bell,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layers,
  ArrowRight,
} from "lucide-react";
import type { GoogleCalendarItem, SyncResult } from "@/types/calendar";

interface SyncControlsProps {
  isAuthenticated: boolean;
  calendars: GoogleCalendarItem[];
  onSync: (options: {
    calendarId: string;
    createDedicatedCalendar: boolean;
    reminderMinutes: number[];
  }) => Promise<void>;
  isSyncing: boolean;
  syncResult: SyncResult | null;
  onLoginRequest: () => void;
}

export function SyncControls({
  isAuthenticated,
  calendars,
  onSync,
  isSyncing,
  syncResult,
  onLoginRequest,
}: SyncControlsProps) {
  const [calendarMode, setCalendarMode] = useState<
    "dedicated" | "primary" | "custom"
  >("dedicated");
  const [selectedCalendarId, setSelectedCalendarId] =
    useState<string>("primary");
  const [reminder1Day, setReminder1Day] = useState(true);
  const [reminder2Hours, setReminder2Hours] = useState(true);
  const [reminder30Mins, setReminder30Mins] = useState(false);

  const handleStartSync = async () => {
    if (!isAuthenticated) {
      onLoginRequest();
      return;
    }

    const reminders: number[] = [];
    if (reminder1Day) reminders.push(1440);
    if (reminder2Hours) reminders.push(120);
    if (reminder30Mins) reminders.push(30);

    const isDedicated = calendarMode === "dedicated";
    const targetId = isDedicated
      ? "dedicated"
      : calendarMode === "primary"
        ? "primary"
        : selectedCalendarId;

    await onSync({
      calendarId: targetId,
      createDedicatedCalendar: isDedicated,
      reminderMinutes: reminders,
    });
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#2c49b6]" />
            <span>Pusat Sinkronisasi Google Calendar</span>
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Atur kalender target dan notifikasi pengingat sebelum mengeksekusi
            sinkronisasi.
          </p>
        </div>
        {isAuthenticated && (
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 self-start sm:self-auto">
            <CheckCircle2 className="w-3.5 h-3.5" /> Google Terhubung
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Kolom 1: Pilihan Kalender Tujuan */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-slate-700 uppercase tracking-wider block">
            Kalender Tujuan
          </label>
          <div className="space-y-2">
            <label
              className={`flex items-start gap-3 p-3 rounded-md border cursor-pointer transition-all ${
                calendarMode === "dedicated"
                  ? "border-[#2c49b6] bg-blue-50/50 shadow-xs"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <input
                type="radio"
                name="calMode"
                checked={calendarMode === "dedicated"}
                onChange={() => setCalendarMode("dedicated")}
                className="mt-0.5 text-[#2c49b6] focus:ring-[#2c49b6]"
              />
              <div className="text-sm">
                <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <span>
                    Buat Kalender Khusus &quot;OASE UNUD - Akademik&quot;
                  </span>
                  <span className="bg-blue-600 text-sm text-white px-1.5 py-0.5 rounded font-normal">
                    Rekomendasi
                  </span>
                </div>
                <p className="text-slate-500 text-sm mt-0.5">
                  Membuat kalender terpisah khusus OASE agar jadwal kuliah tidak
                  bercampur dengan agenda pribadi.
                </p>
              </div>
            </label>

            <label
              className={`flex items-start gap-3 p-3 rounded-md border cursor-pointer transition-all ${
                calendarMode === "primary"
                  ? "border-[#2c49b6] bg-blue-50/50 shadow-xs"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <input
                type="radio"
                name="calMode"
                checked={calendarMode === "primary"}
                onChange={() => setCalendarMode("primary")}
                className="mt-0.5 text-[#2c49b6] focus:ring-[#2c49b6]"
              />
              <div className="text-sm">
                <div className="font-semibold text-slate-800">
                  Kalender Utama (Primary)
                </div>
                <p className="text-slate-500 text-sm mt-0.5">
                  Sinkronisasikan langsung ke kalender default akun Google Anda.
                </p>
              </div>
            </label>

            {calendars.length > 0 && (
              <label
                className={`flex items-start gap-3 p-3 rounded-md border cursor-pointer transition-all ${
                  calendarMode === "custom"
                    ? "border-[#2c49b6] bg-blue-50/50 shadow-xs"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <input
                  type="radio"
                  name="calMode"
                  checked={calendarMode === "custom"}
                  onChange={() => setCalendarMode("custom")}
                  className="mt-0.5 text-[#2c49b6] focus:ring-[#2c49b6]"
                />
                <div className="text-sm flex-1">
                  <div className="font-semibold text-slate-800">
                    Pilih dari Kalender Lain
                  </div>
                  {calendarMode === "custom" && (
                    <select
                      value={selectedCalendarId}
                      onChange={(e) => setSelectedCalendarId(e.target.value)}
                      className="mt-2 block w-full text-sm rounded border border-slate-300 bg-white py-1.5 px-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#2c49b6]"
                    >
                      {calendars.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.summary} {c.primary ? "(Primary)" : ""}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </label>
            )}
          </div>
        </div>

        {/* Kolom 2: Pengaturan Notifikasi Alarm & Info */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-slate-700 uppercase tracking-wider block">
            Pengingat Notifikasi (Google Alert)
          </label>
          <div className="p-3.5 rounded-md border border-slate-200 bg-slate-50/70 space-y-2.5">
            <label className="flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={reminder1Day}
                onChange={(e) => setReminder1Day(e.target.checked)}
                className="rounded border-slate-300 text-[#2c49b6] focus:ring-[#2c49b6]"
              />
              <span className="flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-amber-500" />
                <span>1 Hari (24 Jam) sebelum batas pengumpulan</span>
              </span>
            </label>

            <label className="flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={reminder2Hours}
                onChange={(e) => setReminder2Hours(e.target.checked)}
                className="rounded border-slate-300 text-[#2c49b6] focus:ring-[#2c49b6]"
              />
              <span className="flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-amber-500" />
                <span>2 Jam sebelum batas pengumpulan</span>
              </span>
            </label>

            <label className="flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={reminder30Mins}
                onChange={(e) => setReminder30Mins(e.target.checked)}
                className="rounded border-slate-300 text-[#2c49b6] focus:ring-[#2c49b6]"
              />
              <span className="flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-slate-400" />
                <span>30 Menit sebelum batas pengumpulan (Final reminder)</span>
              </span>
            </label>
          </div>

          <div className="bg-blue-50/60 border border-blue-100 rounded-md p-3 text-sm text-blue-800 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-[#2c49b6] shrink-0 mt-0.5" />
            <span>
              <strong>Smart Idempotent:</strong> Sistem mendeteksi otomatis jika
              tugas sudah pernah disinkronkan, sehingga tidak akan menduplikasi
              jadwal yang sama.
            </span>
          </div>
        </div>
      </div>

      {/* Action Sync Button */}
      <div className="pt-2">
        {isAuthenticated ? (
          <button
            type="button"
            onClick={handleStartSync}
            disabled={isSyncing}
            className={`w-full py-3.5 px-6 rounded-md font-semibold text-sm text-white shadow-sm transition-all flex items-center justify-center gap-2 ${
              isSyncing
                ? "bg-[#2c49b6]/80 cursor-wait"
                : "bg-[#005eb8] hover:bg-[#004ba8] active:scale-[0.99]"
            }`}
          >
            <RefreshCw
              className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`}
            />
            <span>
              {isSyncing
                ? "Sedang Menyinkronkan Jadwal ke Google Calendar..."
                : "Sinkronkan Sekarang ke Google Calendar"}
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onLoginRequest}
            className="w-full py-3.5 px-6 rounded-md font-semibold text-sm text-white bg-[#2c49b6] hover:bg-[#22398d] shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <Calendar className="w-4 h-4 text-amber-300" />
            <span>Hubungkan Google Calendar untuk Mulai Sinkronisasi</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Hasil Sinkronisasi */}
      {syncResult && (
        <div className="border border-emerald-200 bg-emerald-50/70 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>
                Sinkronisasi Berhasil ke &quot;{syncResult.calendarName}&quot;
              </span>
            </div>
            <span className="text-sm text-emerald-700">
              {new Date(syncResult.syncedAt).toLocaleTimeString("id-ID")} WITA
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-sm">
            <div className="bg-white p-2.5 rounded border border-emerald-200/80 shadow-xs">
              <div className="text-slate-500 text-sm">
                Total Tugas Ditemukan
              </div>
              <div className="text-base font-bold text-slate-800">
                {syncResult.totalEvents}
              </div>
            </div>
            <div className="bg-white p-2.5 rounded border border-emerald-200/80 shadow-xs">
              <div className="text-emerald-600 text-sm font-semibold">
                Event Baru Dibuat
              </div>
              <div className="text-base font-bold text-emerald-600">
                +{syncResult.created}
              </div>
            </div>
            <div className="bg-white p-2.5 rounded border border-emerald-200/80 shadow-xs">
              <div className="text-blue-600 text-sm font-semibold">
                Event Diperbarui
              </div>
              <div className="text-base font-bold text-blue-600">
                {syncResult.updated}
              </div>
            </div>
            <div className="bg-white p-2.5 rounded border border-emerald-200/80 shadow-xs">
              <div className="text-slate-400 text-sm">
                Sudah Sinkron (Dilewati)
              </div>
              <div className="text-base font-bold text-slate-600">
                {syncResult.skipped}
              </div>
            </div>
          </div>

          {syncResult.errors.length > 0 && (
            <div className="bg-rose-50 border border-rose-200 rounded p-2.5 text-sm text-rose-800 space-y-1">
              <div className="font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>
                  Peringatan ({syncResult.errors.length} event mengalami
                  kendala):
                </span>
              </div>
              <ul className="list-disc list-inside text-sm space-y-0.5">
                {syncResult.errors.slice(0, 3).map((err, i) => (
                  <li key={i}>
                    {err.title}: {err.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
