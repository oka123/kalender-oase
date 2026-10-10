"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ShieldCheck, AlertCircle } from "lucide-react";

export interface CaptchaState {
  isVerified: boolean;
  turnstileToken?: string;
}

interface SecurityCaptchaProps {
  onVerifyChange: (state: CaptchaState) => void;
  className?: string;
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

export function SecurityCaptcha({
  onVerifyChange,
  className = "",
}: SecurityCaptchaProps) {
  const [siteKey, setSiteKey] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingToken, setIsSubmittingToken] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onVerifyChangeRef = useRef(onVerifyChange);

  useEffect(() => {
    onVerifyChangeRef.current = onVerifyChange;
  }, [onVerifyChange]);

  // Ambil site key & status cookie verifikasi dari server
  useEffect(() => {
    let ignore = false;

    async function loadConfig() {
      try {
        const res = await fetch("/api/captcha");
        const data = await res.json();

        if (ignore) return;

        if (res.ok) {
          if (data.siteKey) {
            setSiteKey(data.siteKey);
          } else {
            setErrorMsg(
              "Cloudflare Turnstile belum dikonfigurasi (NEXT_PUBLIC_TURNSTILE_SITE_KEY belum disetel di .env.local).",
            );
          }

          if (data.isVerified) {
            setIsVerified(true);
            onVerifyChangeRef.current({ isVerified: true });
          }
        } else {
          setErrorMsg(data.error || "Gagal memuat status verifikasi keamanan.");
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

  // Validasi token ke server backend (/api/captcha) untuk membuat HttpOnly cookie
  const handleTokenReceived = useCallback(async (token: string) => {
    setIsSubmittingToken(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/captcha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsVerified(true);
        onVerifyChangeRef.current({ isVerified: true, turnstileToken: token });
      } else {
        throw new Error(
          data.error || "Validasi token keamanan gagal diproses server.",
        );
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Gagal memverifikasi ke server.";
      setErrorMsg(msg);
      setIsVerified(false);
      onVerifyChangeRef.current({ isVerified: false });
    } finally {
      setIsSubmittingToken(false);
    }
  }, []);

  // Inisialisasi widget Cloudflare Turnstile
  useEffect(() => {
    if (!siteKey || !containerRef.current || isVerified) return;

    let isMounted = true;

    const renderWidget = () => {
      if (!window.turnstile || !containerRef.current || !isMounted) return;

      if (widgetIdRef.current) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // ignore
        }
        widgetIdRef.current = null;
      }

      try {
        const id = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme: "light",
          callback: (token: string) => {
            if (!isMounted) return;
            handleTokenReceived(token);
          },
          "error-callback": () => {
            if (!isMounted) return;
            setErrorMsg(
              "Verifikasi keamanan Cloudflare gagal. Silakan coba lagi.",
            );
            setIsVerified(false);
            onVerifyChangeRef.current({ isVerified: false });
          },
          "expired-callback": () => {
            if (!isMounted) return;
            setIsVerified(false);
            setErrorMsg(
              "Sesi verifikasi telah kedaluwarsa. Silakan muat ulang.",
            );
            onVerifyChangeRef.current({ isVerified: false });
          },
        });
        widgetIdRef.current = id;
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
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // ignore cleanup error
        }
      }
    };
  }, [siteKey, isVerified, handleTokenReceived]);

  // Cegah scroll pada body saat modal verifikasi sedang aktif
  useEffect(() => {
    if (!isVerified && siteKey) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isVerified, siteKey]);

  // Jika sudah terverifikasi, atau sedang memuat status sesi awal: jangan tampilkan modal
  if (isVerified || (isLoading && !siteKey)) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md transition-all duration-300 animate-in fade-in m-0! overscroll-contain">
      <div
        id="security-verification"
        className={`max-w-md w-full rounded-2xl border border-slate-100 bg-white p-6 sm:p-7 shadow-2xl text-center space-y-4 transition-all duration-200 transform scale-100 animate-in zoom-in-95 ${className}`}
      >
        <div className="mx-auto w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200/60 flex items-center justify-center text-[#005eb8] shadow-inner">
          <ShieldCheck className="w-6 h-6" />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center justify-center gap-1.5">
            <span>Verifikasi Keamanan</span>
            <span className="text-2xs font-bold uppercase tracking-wider bg-blue-100/80 text-[#005eb8] px-2 py-0.5 rounded-full">
              Cloudflare
            </span>
          </h2>
          <p className="text-sm sm:text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
            Harap selesaikan verifikasi ini untuk membuktikan Anda bukan bot.
          </p>
        </div>

        {siteKey ? (
          <div className="space-y-3 pt-1">
            <div
              ref={containerRef}
              className="flex justify-center py-1 min-h-16.25"
            />

            {isSubmittingToken && (
              <div className="flex items-center justify-center gap-2 text-sm text-[#005eb8] font-medium pt-1">
                <div className="w-3.5 h-3.5 border-2 border-[#005eb8] border-t-transparent rounded-full animate-spin" />
                <span>Memvalidasi token dengan Cloudflare...</span>
              </div>
            )}

            {errorMsg && (
              <div className="flex items-center justify-center gap-1.5 text-sm text-rose-700 font-medium pt-1 bg-rose-50 border border-rose-200 rounded-md p-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800 space-y-1 text-left">
            <div className="font-semibold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Kunci Cloudflare Turnstile Belum Dikonfigurasi</span>
            </div>
            <p className="text-slate-600">
              Tambahkan <code>NEXT_PUBLIC_TURNSTILE_SITE_KEY</code> dan{" "}
              <code>TURNSTILE_SECRET_KEY</code> pada file{" "}
              <code>.env.local</code> untuk mengaktifkan perlindungan bot.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
