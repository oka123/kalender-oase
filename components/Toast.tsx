"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useMemo,
  useEffect,
} from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  toast: {
    success: (message: string, duration?: number) => void;
    error: (message: string, duration?: number) => void;
    info: (message: string, duration?: number) => void;
  };
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timeoutsRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timeoutsRef.current.delete(id);
    }
  }, []);

  const toastsRef = useRef<ToastItem[]>([]);
  useEffect(() => {
    toastsRef.current = toasts;
  }, [toasts]);

  const showToast = useCallback(
    (message: string, type: ToastType = "info", duration = 4000) => {
      // Cegah duplikasi jika toast dengan pesan & tipe yang sama sedang aktif
      const existingToast = toastsRef.current.find(
        (t) => t.message === message && t.type === type,
      );

      if (existingToast) {
        // Reset timer toast yang sudah ada
        const existingTimer = timeoutsRef.current.get(existingToast.id);
        if (existingTimer) {
          clearTimeout(existingTimer);
        }
        if (duration > 0) {
          const newTimer = setTimeout(() => {
            dismissToast(existingToast.id);
          }, duration);
          timeoutsRef.current.set(existingToast.id, newTimer);
        }
        return;
      }

      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const newToast: ToastItem = { id, type, message, duration };

      setToasts((prev) => [...prev.slice(-4), newToast]); // Maksimal 5 toast sekaligus

      if (duration > 0) {
        const timer = setTimeout(() => {
          dismissToast(id);
        }, duration);
        timeoutsRef.current.set(id, timer);
      }
    },
    [dismissToast],
  );

  const toast = useMemo(
    () => ({
      success: (message: string, duration?: number) =>
        showToast(message, "success", duration),
      error: (message: string, duration?: number) =>
        showToast(message, "error", duration),
      info: (message: string, duration?: number) =>
        showToast(message, "info", duration),
    }),
    [showToast],
  );

  // Bersihkan semua timer saat unmount
  useEffect(() => {
    const timeouts = timeoutsRef.current;
    return () => {
      timeouts.forEach((timer) => clearTimeout(timer));
      timeouts.clear();
    };
  }, []);

  return (
    <ToastContext.Provider
      value={{
        showToast,
        toast,
        dismissToast,
      }}
    >
      {children}

      {/* Floating Toast Container */}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 left-4 sm:left-auto sm:right-6 sm:bottom-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
      >
        {toasts.map((item) => (
          <div
            key={item.id}
            role={item.type === "error" ? "alert" : "status"}
            className="pointer-events-auto rounded-xl border border-slate-200/90 bg-white p-3.5 sm:p-4 shadow-lg text-slate-800 flex items-start gap-3 transition-all duration-200 animate-in slide-in-from-bottom-3 fade-in"
          >
            {item.type === "success" && (
              <div className="w-5 h-5 rounded-full bg-emerald-100/70 flex items-center justify-center shrink-0 mt-0.5 text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            )}
            {item.type === "error" && (
              <div className="w-5 h-5 rounded-full bg-rose-100/70 flex items-center justify-center shrink-0 mt-0.5 text-rose-600">
                <AlertCircle className="w-4 h-4" />
              </div>
            )}
            {item.type === "info" && (
              <div className="w-5 h-5 rounded-full bg-blue-100/70 flex items-center justify-center shrink-0 mt-0.5 text-[#005eb8]">
                <Info className="w-4 h-4" />
              </div>
            )}

            <div className="flex-1 text-sm sm:text-sm font-medium leading-relaxed pr-1 text-slate-800">
              {item.message}
            </div>

            <button
              type="button"
              onClick={() => dismissToast(item.id)}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors cursor-pointer shrink-0"
              aria-label="Tutup notifikasi"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast harus digunakan di dalam ToastProvider");
  }
  return context;
}
