"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  Suspense,
  useMemo,
} from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/Header";
import { SyncControls } from "@/components/SyncControls";
import { EventsList } from "@/components/EventsList";
import { IcalConfigCard } from "@/components/IcalConfigCard";
import { GithubActionsModal } from "@/components/GithubActionsModal";
import { FaqSection } from "@/components/FaqSection";
import { Logo } from "@/components/Logo";
import { WorkflowStepper } from "@/components/WorkflowStepper";
import type {
  OaseEvent,
  GoogleCalendarItem,
  SyncResult,
} from "@/types/calendar";
import {
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  GraduationCap,
} from "lucide-react";

function DashboardContent() {
  const searchParams = useSearchParams();

  // State
  const [user, setUser] = useState<{
    email?: string | null;
    name?: string | null;
    picture?: string | null;
  } | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);
  const [isGithubModalOpen, setIsGithubModalOpen] = useState<boolean>(false);
  const [calendars, setCalendars] = useState<GoogleCalendarItem[]>([]);
  const [events, setEvents] = useState<OaseEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [hasConfiguredUrl, setHasConfiguredUrl] = useState<boolean>(false);
  const [customIcalUrl, setCustomIcalUrl] = useState<string>("");
  const [isCustomUrlActive, setIsCustomUrlActive] = useState<boolean>(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isQueryNotifDismissed, setIsQueryNotifDismissed] =
    useState<boolean>(false);

  const authStatus = searchParams.get("auth");
  const authError = searchParams.get("auth_error");

  const queryNotification = useMemo(() => {
    if (authStatus === "success") {
      return {
        type: "success" as const,
        message:
          "Akun Google berhasil dihubungkan! Anda dapat mulai menyinkronkan jadwal sekarang.",
      };
    }
    if (authError) {
      return {
        type: "error" as const,
        message: decodeURIComponent(authError),
      };
    }
    return null;
  }, [authStatus, authError]);

  const activeNotification =
    notification || (isQueryNotifDismissed ? null : queryNotification);

  // Muat daftar kalender Google
  const loadCalendars = useCallback(async () => {
    try {
      const res = await fetch("/api/calendars");
      if (res.ok) {
        const data = await res.json();
        setCalendars(data.calendars || []);
      }
    } catch {
      // Kalender gagal dimuat
    }
  }, []);

  // Muat jadwal dari OASE langsung via URL
  const loadEvents = useCallback(async (customUrl?: string) => {
    setIsLoadingEvents(true);
    try {
      const params = new URLSearchParams();
      if (customUrl) params.set("url", customUrl);

      const res = await fetch(`/api/preview?${params.toString()}`);
      const data = await res.json();

      if (res.ok) {
        setEvents(data.events || []);
        setHasConfiguredUrl(Boolean(data.hasConfiguredUrl));
      } else {
        setNotification({
          type: "error",
          message: data.error || "Gagal memuat feed iCal OASE.",
        });
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Koneksi ke server gagal.";
      setNotification({
        type: "error",
        message: msg,
      });
    } finally {
      setIsLoadingEvents(false);
    }
  }, []);

  // Handler OAuth login
  const handleLogin = async () => {
    try {
      const res = await fetch("/api/auth/google/url");
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Gagal mengambil URL otorisasi Google");
      }
    } catch {
      alert("Terjadi kesalahan saat memulai autentikasi Google.");
    }
  };

  // Handler Logout
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      setIsAuthenticated(false);
      setCalendars([]);
      setNotification({
        type: "success",
        message: "Berhasil keluar dari akun Google.",
      });
    } catch {
      alert("Gagal melakukan logout");
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Handler Sinkronisasi
  const handleSync = async (options: {
    calendarId: string;
    createDedicatedCalendar: boolean;
    reminderMinutes: number[];
    turnstileToken?: string;
  }) => {
    setIsSyncing(true);
    setSyncResult(null);

    try {
      const body = {
        ...options,
        customIcalUrl: isCustomUrlActive ? customIcalUrl : undefined,
        turnstileToken: options.turnstileToken,
      };

      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSyncResult(data.result);
        setNotification({
          type: "success",
          message: data.message || "Sinkronisasi berhasil!",
        });
        if (options.createDedicatedCalendar) {
          loadCalendars();
        }
      } else {
        setNotification({
          type: "error",
          message: data.error || "Gagal menjalankan sinkronisasi.",
        });
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Terjadi kegagalan komunikasi saat sinkronisasi.";
      setNotification({
        type: "error",
        message: msg,
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Bersihkan status parameter auth dari URL browser setelah dibaca
  useEffect(() => {
    if (authStatus || authError) {
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [authStatus, authError]);

  // Inisialisasi data awal (auth check & preview jadwal)
  useEffect(() => {
    let ignore = false;

    async function init() {
      // 1. Cek sesi Google
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (!ignore) {
          if (data.authenticated) {
            setIsAuthenticated(true);
            setUser(data.user);
            const calRes = await fetch("/api/calendars");
            if (calRes.ok) {
              const calData = await calRes.json();
              if (!ignore) {
                setCalendars(calData.calendars || []);
              }
            }
          } else {
            setIsAuthenticated(false);
            setUser(null);
          }
        }
      } catch {
        if (!ignore) {
          setIsAuthenticated(false);
        }
      }

      // 2. Muat jadwal awal OASE
      try {
        const previewRes = await fetch("/api/preview");
        const previewData = await previewRes.json();
        if (!ignore) {
          if (previewRes.ok) {
            setEvents(previewData.events || []);
            setHasConfiguredUrl(Boolean(previewData.hasConfiguredUrl));
          } else {
            setNotification({
              type: "error",
              message: previewData.error || "Gagal memuat feed iCal OASE.",
            });
          }
        }
      } catch (err: unknown) {
        if (!ignore) {
          const msg =
            err instanceof Error ? err.message : "Koneksi ke server gagal.";
          setNotification({
            type: "error",
            message: msg,
          });
        }
      } finally {
        if (!ignore) {
          setIsLoadingEvents(false);
        }
      }
    }

    init();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        isLoggingOut={isLoggingOut}
        onOpenGithubSetup={() => setIsGithubModalOpen(true)}
      />

      <GithubActionsModal
        isOpen={isGithubModalOpen}
        onClose={() => setIsGithubModalOpen(false)}
        isAuthenticated={isAuthenticated}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 space-y-6">
        {/* Banner Alert Notifikasi */}
        {activeNotification && (
          <div
            className={`p-4 rounded-lg flex items-start justify-between gap-3 shadow-xs border ${
              activeNotification.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-rose-50 text-rose-800 border-rose-200"
            }`}
          >
            <div className="flex items-center gap-2 text-sm font-medium">
              {activeNotification.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
              <span>{activeNotification.message}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setNotification(null);
                setIsQueryNotifDismissed(true);
              }}
              className="text-sm font-semibold hover:opacity-75"
            >
              Tutup
            </button>
          </div>
        )}

        {/* Hero Banner Pendahuluan */}
        <div className="bg-linear-to-r from-[#001d62] via-[#204c96] to-[#005eb8] text-white rounded-xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-blue-100 border border-white/20">
                  <GraduationCap className="w-4 h-4 text-amber-300" />
                  <span>Universitas Udayana</span>
                </div>
                {/* <span className="text-sm font-bold px-3 py-1 rounded-full bg-amber-400/20 text-amber-200 border border-amber-300/30">
                  Tersedia untuk Seluruh Mahasiswa UNUD
                </span> */}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Kalender OASE
              </h1>
              <p className="text-sm text-blue-100/90 leading-relaxed">
                Sinkronisasi jadwal tugas dan kegiatan dari OASE Moodle ke Google Calendar secara otomatis.
              </p>
            </div>

            {/* Logo Badge di Hero */}
            <div className="hidden md:flex items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-inner shrink-0">
              <Logo size={76} priority className="drop-shadow-md" />
            </div>
          </div>
          {/* Subtle Decorative Background Element */}
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-radial from-white to-transparent pointer-events-none" />
        </div>

        {/* 3-Step Alur Cepat Onboarding */}
        <WorkflowStepper
          isAuthenticated={isAuthenticated}
          eventsCount={events.length}
          hasSynced={Boolean(syncResult)}
          onLoginClick={handleLogin}
          onScrollToSync={() => {
            document
              .getElementById("sync-controls")
              ?.scrollIntoView({ behavior: "smooth" });
          }}
          onScrollToEvents={() => {
            document
              .getElementById("events-list")
              ?.scrollIntoView({ behavior: "smooth" });
          }}
        />

        {/* Konfigurasi Sumber iCal */}
        <IcalConfigCard
          hasConfiguredUrl={hasConfiguredUrl}
          isCustomUrlActive={isCustomUrlActive}
          onApplyCustomUrl={(newUrl) => {
            setCustomIcalUrl(newUrl);
            setIsCustomUrlActive(true);
            loadEvents(newUrl);
          }}
          onResetToDefault={() => {
            setCustomIcalUrl("");
            setIsCustomUrlActive(false);
            loadEvents();
          }}
        />

        {/* Pusat Kontrol Sinkronisasi */}
        <SyncControls
          isAuthenticated={isAuthenticated}
          calendars={calendars}
          onSync={handleSync}
          isSyncing={isSyncing}
          syncResult={syncResult}
          onLoginRequest={handleLogin}
        />

        {/* Daftar Agenda & Event Preview */}
        <EventsList
          events={events}
          isLoading={isLoadingEvents}
          onRefresh={() =>
            loadEvents(isCustomUrlActive ? customIcalUrl : undefined)
          }
        />

        {/* Section FAQ & Panduan SEO */}
        <FaqSection />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-sm text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Stateless &bull; Data Terlindungi</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-sm font-medium">
            <Link
              href="/privacy"
              className="hover:text-slate-900 hover:underline transition-colors"
            >
              Privacy Policy
            </Link>
            <span className="text-slate-300">&bull;</span>
            <Link
              href="/terms"
              className="hover:text-slate-900 hover:underline transition-colors"
            >
              Terms of Service
            </Link>
            <span className="text-slate-300">&bull;</span>
            <p>
              &copy; {new Date().getFullYear()} Kalender OASE &bull; Universitas
              Udayana
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="w-8 h-8 border-3 border-[#2c49b6] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
