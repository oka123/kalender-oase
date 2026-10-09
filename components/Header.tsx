"use client";

import React from "react";
import { Logo } from "@/components/Logo";
import { LogOut, User, GitBranch } from "lucide-react";

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
          <Logo
            size="md"
            priority
            className="shadow-xs bg-white p-0.5 border border-white/20"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-lg text-white">
                Kalender OASE
              </span>
            </div>
            <p className="text-sm text-blue-200/80 hidden sm:block">
              Universitas Udayana
            </p>
          </div>
        </div>

        {/* User Account / Auth Widget */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenGithubSetup}
            className="inline-flex items-center gap-1.5 text-sm font-semibold px-2.5 sm:px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors cursor-pointer"
            title="Setup GitHub Actions"
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
                <div className="font-medium text-white">
                  <span className="truncate max-w-37.5 block">
                    {user.name || user.email}
                  </span>
                </div>
                <div className="text-sm text-blue-200/70 truncate max-w-37.5">
                  {user.email}
                </div>
              </div>
              <button
                type="button"
                onClick={onLogout}
                disabled={isLoggingOut}
                className="ml-1 p-1.5 text-slate-300 hover:text-rose-300 hover:bg-rose-500/20 rounded-full transition-colors cursor-pointer"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onLogin}
              className="inline-flex items-center gap-2 bg-[#2c49b6] hover:bg-[#22398d] text-white px-4 py-2 rounded-md font-medium text-sm transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="1em"
                height="1em"
                viewBox="0 0 128 128"
              >
                <path d="M0 0h128v128H0z" fill="none" />
                <path
                  fill="#fff"
                  d="M44.59 4.21a63.28 63.28 0 0 0 4.33 120.9a67.6 67.6 0 0 0 32.36.35a57.13 57.13 0 0 0 25.9-13.46a57.44 57.44 0 0 0 16-26.26a74.3 74.3 0 0 0 1.61-33.58H65.27v24.69h34.47a29.72 29.72 0 0 1-12.66 19.52a36.2 36.2 0 0 1-13.93 5.5a41.3 41.3 0 0 1-15.1 0A37.2 37.2 0 0 1 44 95.74a39.3 39.3 0 0 1-14.5-19.42a38.3 38.3 0 0 1 0-24.63a39.25 39.25 0 0 1 9.18-14.91A37.17 37.17 0 0 1 76.13 27a34.3 34.3 0 0 1 13.64 8q5.83-5.8 11.64-11.63c2-2.09 4.18-4.08 6.15-6.22A61.2 61.2 0 0 0 87.2 4.59a64 64 0 0 0-42.61-.38"
                />
                <path
                  fill="#e33629"
                  d="M44.59 4.21a64 64 0 0 1 42.61.37a61.2 61.2 0 0 1 20.35 12.62c-2 2.14-4.11 4.14-6.15 6.22Q95.58 29.23 89.77 35a34.3 34.3 0 0 0-13.64-8a37.17 37.17 0 0 0-37.46 9.74a39.25 39.25 0 0 0-9.18 14.91L8.76 35.6A63.53 63.53 0 0 1 44.59 4.21"
                />
                <path
                  fill="#f8bd00"
                  d="M3.26 51.5a63 63 0 0 1 5.5-15.9l20.73 16.09a38.3 38.3 0 0 0 0 24.63q-10.36 8-20.73 16.08a63.33 63.33 0 0 1-5.5-40.9"
                />
                <path
                  fill="#587dbd"
                  d="M65.27 52.15h59.52a74.3 74.3 0 0 1-1.61 33.58a57.44 57.44 0 0 1-16 26.26c-6.69-5.22-13.41-10.4-20.1-15.62a29.72 29.72 0 0 0 12.66-19.54H65.27c-.01-8.22 0-16.45 0-24.68"
                />
                <path
                  fill="#319f43"
                  d="M8.75 92.4q10.37-8 20.73-16.08A39.3 39.3 0 0 0 44 95.74a37.2 37.2 0 0 0 14.08 6.08a41.3 41.3 0 0 0 15.1 0a36.2 36.2 0 0 0 13.93-5.5c6.69 5.22 13.41 10.4 20.1 15.62a57.13 57.13 0 0 1-25.9 13.47a67.6 67.6 0 0 1-32.36-.35a63 63 0 0 1-23-11.59A63.7 63.7 0 0 1 8.75 92.4"
                />
              </svg>

              <span>Connect Google</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
