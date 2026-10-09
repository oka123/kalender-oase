"use client";

import React from "react";
import { Logo } from "@/components/Logo";
import {
  LogIn,
  LogOut,
  CheckCircle2,
  User,
  GitBranch,
} from "lucide-react";

interface HeaderProps {
  user: {
    email?: string | null;
    name?: string | null;
    picture?: string | null;
  } | null;
  onLogin: () => void;
  onLogout: () => void;
  isLoggingOut: boolean;
  onOpenGithubSetup: () => void;
}

export function Header({
  user,
  onLogin,
  onLogout,
  isLoggingOut,
  onOpenGithubSetup,
}: HeaderProps) {
  return (
    <header className="bg-[#001d62] text-white border-b border-[#041336] shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <Logo size="md" priority className="shadow-xs bg-white/10 p-0.5 border border-white/20" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-lg text-white">
                OASE Sync
              </span>
              <span className="hidden sm:inline-block text-sm uppercase font-semibold px-2 py-0.5 rounded bg-blue-500/20 text-blue-200 border border-blue-400/30">
                UNUD Academic
              </span>
            </div>
            <p className="text-sm text-slate-300 hidden sm:block">
              Universitas Udayana Moodle to Google Calendar Sync
            </p>
          </div>
        </div>

        {/* User Account / Auth Widget */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenGithubSetup}
            className="inline-flex items-center gap-1.5 text-sm font-semibold px-2.5 sm:px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors cursor-pointer"
            title="Setup otomatisasi sinkronisasi 24/7 menggunakan GitHub Actions"
          >
            <GitBranch className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="hidden sm:inline">GitHub Actions</span>
          </button>
          {user ? (
            <div className="flex items-center gap-3 bg-[#041336]/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-blue-400/20">
              {user.picture ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.picture}
                  alt={user.name || "User"}
                  className="w-7 h-7 rounded-full border border-blue-300"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-sm font-semibold">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
              <div className="hidden md:block text-left text-sm leading-tight">
                <div className="font-medium text-white flex items-center gap-1.5">
                  <span className="truncate max-w-37.5">
                    {user.name || user.email}
                  </span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                </div>
                <div className="text-sm text-slate-300 truncate max-w-37.5">
                  {user.email}
                </div>
              </div>
              <button
                type="button"
                onClick={onLogout}
                disabled={isLoggingOut}
                className="ml-1 p-1.5 text-slate-300 hover:text-rose-300 hover:bg-rose-500/20 rounded-full transition-colors"
                title="Keluar dari akun Google"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onLogin}
              className="inline-flex items-center gap-2 bg-[#2c49b6] hover:bg-[#22398d] text-white px-4 py-2 rounded-md font-medium text-sm transition-all shadow-sm active:scale-95"
            >
              <LogIn className="w-4 h-4 text-amber-300" />
              <span>Hubungkan Google</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
