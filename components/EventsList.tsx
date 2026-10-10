"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  BookOpen,
  Calendar,
  Clock,
  ExternalLink,
  ChevronDown,
  RefreshCw,
} from "lucide-react";
import type { OaseEvent } from "@/types/calendar";

interface EventsListProps {
  events: OaseEvent[];
  isLoading: boolean;
  onRefresh: () => void;
}

export function EventsList({ events, isLoading, onRefresh }: EventsListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filter & Search
  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) {
      return events;
    }

    const query = searchQuery.toLowerCase();
    return events.filter((ev) => {
      const matchTitle = ev.cleanTitle.toLowerCase().includes(query);
      const matchCourse = ev.courseName.toLowerCase().includes(query);
      const matchDesc = ev.cleanDescription.toLowerCase().includes(query);
      return matchTitle || matchCourse || matchDesc;
    });
  }, [events, searchQuery]);

  const toggleExpand = (uid: string) => {
    setExpandedId((prev) => (prev === uid ? null : uid));
  };

  // Badge countdown minimalis
  const getDeadlineBadge = (date: Date) => {
    const now = new Date().getTime();
    const target = new Date(date).getTime();
    const diffHours = (target - now) / (1000 * 60 * 60);

    if (diffHours < 0) {
      return (
        <span className="text-sm font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-500">
          Lewat
        </span>
      );
    }
    if (diffHours <= 24) {
      return (
        <span className="text-sm font-semibold px-2 py-0.5 rounded bg-rose-50 border border-rose-200/80 text-rose-700">
          Hari ini ({Math.ceil(diffHours)}j)
        </span>
      );
    }
    if (diffHours <= 48) {
      return (
        <span className="text-sm font-semibold px-2 py-0.5 rounded bg-amber-50 border border-amber-200/80 text-amber-800">
          Besok
        </span>
      );
    }
    const days = Math.ceil(diffHours / 24);
    return (
      <span className="text-sm font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
        {days} hari lagi
      </span>
    );
  };

  return (
    <div
      id="events-list"
      className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-4 scroll-mt-20"
    >
      {/* Header Minimalis */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#005eb8]" />
          <h2 className="text-base font-bold text-slate-900">Daftar Tugas</h2>
          <span className="text-sm font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
            {events.length}
          </span>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 text-sm text-[#005eb8] hover:text-[#001d62] font-semibold py-1.5 px-2.5 rounded-md hover:bg-blue-50 transition-colors cursor-pointer"
          title="Muat ulang agenda"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`}
          />
          <span>Perbarui</span>
        </button>
      </div>

      {/* Search Bar Minimalis */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari mata kuliah atau kegiatan..."
          className="w-full pl-9 pr-9 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#005eb8] focus:border-[#005eb8] bg-slate-50/50 hover:bg-white focus:bg-white transition-all"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400 hover:text-slate-700 p-1"
          >
            &times;
          </button>
        )}
      </div>

      {/* List Items 2 Kolom Desktop */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 py-1">
          {[1, 2, 3, 4].map((idx) => (
            <div
              key={idx}
              className="border border-slate-100 rounded-lg p-4 bg-slate-50/40 animate-pulse space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="h-4 w-28 bg-slate-200 rounded" />
                <div className="h-4 w-16 bg-slate-200 rounded" />
              </div>
              <div className="h-5 w-3/4 bg-slate-200 rounded" />
              <div className="h-3.5 w-32 bg-slate-200 rounded" />
            </div>
          ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="py-10 text-center text-slate-500 space-y-1.5 border border-dashed border-slate-200 rounded-lg bg-slate-50/40">
          <BookOpen className="w-6 h-6 mx-auto text-slate-400" />
          <p className="text-sm font-medium text-slate-700">
            {searchQuery ? "Tugas tidak ditemukan" : "Tidak ada tugas"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 items-start">
          {filteredEvents.map((event) => {
            const isExpanded = expandedId === event.uid;
            const startDate = new Date(event.start);
            const dateStr = startDate.toLocaleDateString("id-ID", {
              weekday: "short",
              day: "numeric",
              month: "short",
            });
            const timeStr = startDate.toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={event.uid}
                className={`border rounded-lg bg-white transition-all overflow-hidden ${
                  isExpanded
                    ? "border-[#005eb8]/40 shadow-xs ring-1 ring-[#005eb8]/15"
                    : "border-slate-200/90 hover:border-slate-300 hover:shadow-xs"
                }`}
              >
                {/* Header Kartu Minimalis Interaktif */}
                <div
                  role="button"
                  tabIndex={0}
                  aria-expanded={isExpanded}
                  onClick={() => toggleExpand(event.uid)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggleExpand(event.uid);
                    }
                  }}
                  className="p-3.5 sm:p-4 cursor-pointer select-none group focus:outline-none space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="text-sm font-semibold text-slate-600 truncate max-w-50"
                      title={event.courseName}
                    >
                      {event.courseName}
                    </span>
                    <div className="shrink-0 flex items-center gap-1.5">
                      {getDeadlineBadge(startDate)}
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-transform duration-200 ${
                          isExpanded ? "rotate-180 text-[#005eb8]" : ""
                        }`}
                      />
                    </div>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#001d62] leading-snug transition-colors">
                    {event.cleanTitle}
                  </h3>

                  <div className="flex items-center justify-between gap-2 text-sm text-slate-500 pt-0.5">
                    <span className="flex items-center gap-1 text-slate-600 font-medium">
                      <Clock className="w-3.5 h-3.5 text-[#005eb8] shrink-0" />
                      <span>
                        {dateStr} &bull; {timeStr} WITA
                      </span>
                    </span>

                    {event.url &&
                      (event.url.startsWith("https://") ||
                        event.url.startsWith("http://")) && (
                        <a
                          href={event.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-[#005eb8] hover:text-[#001d62] font-semibold hover:underline"
                          title="Buka di OASE"
                        >
                          <span>OASE</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                  </div>
                </div>

                {/* Expanded Details Minimalis */}
                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50/60 p-3.5 text-sm text-slate-600 space-y-2 animate-in fade-in duration-100">
                    {event.cleanDescription ? (
                      <p className="whitespace-pre-line leading-relaxed">
                        {event.cleanDescription}
                      </p>
                    ) : (
                      <p className="text-slate-400 italic">
                        Tidak ada catatan tambahan.
                      </p>
                    )}

                    {event.links && event.links.length > 0 && (
                      <div className="pt-1.5 border-t border-slate-200/60 space-y-1">
                        {event.links
                          .filter(
                            (link) =>
                              link.url &&
                              (link.url.startsWith("https://") ||
                                link.url.startsWith("http://")),
                          )
                          .map((link, idx) => (
                            <a
                              key={idx}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline flex items-center gap-1 truncate"
                            >
                              <span>{link.label || "Lampiran"}:</span>
                              <span className="truncate">{link.url}</span>
                              <ExternalLink className="w-3 h-3 shrink-0" />
                            </a>
                          ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
