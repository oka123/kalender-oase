"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

export interface CaptchaState {
  isVerified: boolean;
  turnstileToken?: string;
}

interface SecurityCaptchaProps {
  onVerifyChange: (state: CaptchaState) => void;
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement | string,
        params: {
          sitekey: string;
          callback: (token: string) => void;
          "error-callback"?: (error: unknown) => void;
          "expired-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
        },
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

export function SecurityCaptcha({ onVerifyChange }: SecurityCaptchaProps) {
  const [siteKey, setSiteKey] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isWidgetReady, setIsWidgetReady] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);

  // Ambil site key dari server
  useEffect(() => {
    let ignore = false;

    async function loadConfig() {
      try {
        const res = await fetch("/api/captcha");
        const data = await res.json();

        if (ignore) return;

        if (res.ok && data.siteKey) {
          setSiteKey(data.siteKey);
        } else {
          setErrorMsg(
            "Cloudflare Turnstile belum dikonfigurasi (NEXT_PUBLIC_TURNSTILE_SITE_KEY belum disetel di .env.local).",
          );
        }
      } catch {
        if (!ignore) {
          setErrorMsg("Gagal memuat konfigurasi keamanan Cloudflare.");
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadConfig();

    return () => {
      ignore = true;
    };
  }, []);

  // Inisialisasi widget Cloudflare Turnstile
  useEffect(() => {
    if (!siteKey || !containerRef.current) return;

    let isMounted = true;

    const renderWidget = () => {
      if (!window.turnstile || !containerRef.current || !isMounted) return;

      if (widgetIdRef.current) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
        setIsWidgetReady(false);
      }

      try {
        const id = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme: "light",
          callback: (token: string) => {
            if (!isMounted) return;
            setIsVerified(true);
            setErrorMsg(null);
            onVerifyChange({ isVerified: true, turnstileToken: token });
          },
          "error-callback": () => {
            if (!isMounted) return;
            setErrorMsg(
              "Verifikasi keamanan Cloudflare gagal. Silakan coba lagi.",
            );
            setIsVerified(false);
            onVerifyChange({ isVerified: false });
          },
          "expired-callback": () => {
            if (!isMounted) return;
            setIsVerified(false);
            setErrorMsg(
              "Sesi verifikasi telah kedaluwarsa. Silakan muat ulang.",
            );
            onVerifyChange({ isVerified: false });
          },
        });
        widgetIdRef.current = id;
        setIsWidgetReady(true);
      } catch (err) {
        console.error("Turnstile render error:", err);
      }
    };

    if (!window.turnstile) {
      const existingScript = document.getElementById("cf-turnstile-script");
      if (!existingScript) {
        const script = document.createElement("script");
        script.id = "cf-turnstile-script";
        script.src =
          "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        script.async = true;
        script.defer = true;
        script.onload = () => {
          renderWidget();
        };
        document.head.appendChild(script);
      } else {
        existingScript.addEventListener("load", renderWidget);
      }
    } else {
      renderWidget();
    }

    return () => {
      isMounted = false;
      setIsWidgetReady(false);
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // ignore cleanup error
        }
      }
    };
  }, [siteKey, onVerifyChange]);

  const handleReset = () => {
    if (widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
      setIsVerified(false);
      setErrorMsg(null);
      onVerifyChange({ isVerified: false });
    }
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3.5 space-y-2.5 transition-all">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-sm sm:text-sm font-semibold text-slate-800">
          <ShieldCheck className="w-4 h-4 text-[#2c49b6]" />
          <span>Verifikasi Keamanan</span>
        </div>
        {isWidgetReady && (
          <button
            type="button"
            onClick={handleReset}
            className="text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1 p-1 rounded hover:bg-slate-200/60 transition-colors cursor-pointer"
            title="Muat ulang verifikasi"
          >
            <RefreshCw className="w-3 h-3" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="py-3 flex items-center justify-center gap-2 text-sm text-slate-500">
          <div className="w-3.5 h-3.5 border-2 border-[#2c49b6] border-t-transparent rounded-full animate-spin" />
          <span>Menyiapkan verifikasi...</span>
        </div>
      ) : siteKey ? (
        <div className="space-y-2">
          <div
            ref={containerRef}
            className="flex justify-center py-1 min-h-16.25"
          />

          {isVerified && (
            <div className="flex items-center justify-center gap-1.5 text-sm text-emerald-700 font-medium pt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Verifikasi berhasil</span>
            </div>
          )}

          {errorMsg && (
            <div className="flex items-center justify-center gap-1.5 text-sm text-rose-700 font-medium pt-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-800 space-y-1">
          <div className="font-semibold flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Kunci Cloudflare Turnstile Belum Dikonfigurasi</span>
          </div>
          <p className="text-slate-600">
            Tambahkan <code>NEXT_PUBLIC_TURNSTILE_SITE_KEY</code> dan{" "}
            <code>TURNSTILE_SECRET_KEY</code> pada file <code>.env.local</code>{" "}
            untuk mengaktifkan tombol sinkronisasi.
          </p>
        </div>
      )}
    </div>
  );
}
