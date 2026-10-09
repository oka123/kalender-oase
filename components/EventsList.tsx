"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  BookOpen,
  Calendar,
  Clock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
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

  // Format countdown status
  const getDeadlineBadge = (date: Date) => {
    const now = new Date().getTime();
    const target = new Date(date).getTime();
    const diffHours = (target - now) / (1000 * 60 * 60);

    if (diffHours < 0) {
      return (
        <span className="text-sm font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
          Selesai / Terlewat
        </span>
      );
    }
    if (diffHours <= 24) {
      return (
        <span className="text-sm font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 animate-pulse">
          Hari Ini! ({Math.ceil(diffHours)} jam lagi)
        </span>
      );
    }
    if (diffHours <= 48) {
      return (
        <span className="text-sm font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
          Besok
        </span>
      );
    }
    const days = Math.ceil(diffHours / 24);
    return (
      <span className="text-sm font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
        {days} hari lagi
      </span>
    );
  };

  return (
    <div id="events-list" className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-5 scroll-mt-20">
      {/* Header Preview & Counter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#2c49b6]" />
            <span>Daftar Kegiatan Kalender OASE</span>
            <span className="text-sm font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
              {events.length} Terdeteksi
            </span>
          </h2>
          <p className="text-sm text-slate-600 mt-0.5">
            Daftar jadwal kegiatan perkuliahan yang diekspor dari kalender OASE Moodle Anda.
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 text-sm text-[#005eb8] hover:text-[#001d62] font-semibold self-start sm:self-auto py-2 px-3 rounded-md hover:bg-blue-50 transition-colors cursor-pointer border border-transparent hover:border-blue-200"
        >
          <Clock className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          <span>Muat Ulang Kalender</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari mata kuliah atau nama kegiatan..."
          className="w-full pl-9 pr-10 py-2.5 text-sm rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#2c49b6] focus:border-[#2c49b6] bg-white shadow-2xs"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500 hover:text-slate-800 p-1 cursor-pointer"
          >
            Hapus
          </button>
        )}
      </div>

      {/* List Items */}
      {isLoading ? (
        <div className="space-y-3 py-2">
          {[1, 2, 3].map((skeletonIndex) => (
            <div
              key={skeletonIndex}
              className="border border-slate-200 rounded-lg p-4 bg-white animate-pulse space-y-3"
            >
              <div className="flex flex-wrap items-center gap-2">
                <div className="h-5 w-20 bg-slate-200 rounded" />
                <div className="h-5 w-40 bg-slate-200 rounded" />
                <div className="h-5 w-24 bg-slate-200 rounded-full" />
              </div>
              <div className="h-6 w-3/4 bg-slate-200 rounded" />
              <div className="flex items-center justify-between pt-1">
                <div className="h-4 w-48 bg-slate-200 rounded" />
                <div className="h-8 w-24 bg-slate-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="py-12 text-center text-slate-500 space-y-2 border border-dashed border-slate-300 rounded-lg bg-slate-50/50">
          <BookOpen className="w-8 h-8 mx-auto text-slate-400" />
          <p className="text-sm font-semibold text-slate-700">
            Tidak ada agenda yang ditemukan
          </p>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            {searchQuery
              ? "Coba gunakan kata kunci pencarian yang lain."
              : "Pastikan URL kalender OASE sudah benar dan memiliki agenda aktif."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEvents.map((event) => {
            const isExpanded = expandedId === event.uid;
            const startDate = new Date(event.start);
            const dateStr = startDate.toLocaleDateString("id-ID", {
              weekday: "short",
              day: "numeric",
              month: "short",
              year: "numeric",
            });
            const timeStr = startDate.toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={event.uid}
                className="border border-slate-200 hover:border-blue-200 rounded-lg bg-white transition-all shadow-xs overflow-hidden"
              >
                <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                        {event.courseName}
                      </span>
                      {getDeadlineBadge(startDate)}
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                      {event.cleanTitle}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                        <Clock className="w-4 h-4 text-[#2c49b6]" />
                        <span>
                          {dateStr} • {timeStr} WITA
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2.5 self-start sm:self-center shrink-0 pt-1 sm:pt-0">
                    {event.url && (
                      <a
                        href={event.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-[#005eb8] hover:text-[#001d62] font-semibold bg-blue-50 hover:bg-blue-100 px-3.5 py-2 rounded-md transition-colors"
                      >
                        <span>Buka OASE</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => toggleExpand(event.uid)}
                      className="p-2 text-slate-500 hover:text-slate-800 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                      title={isExpanded ? "Sembunyikan detail" : "Lihat detail"}
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50/70 p-4 text-sm space-y-3">
                    {event.cleanDescription ? (
                      <div>
                        <div className="font-semibold text-slate-700 mb-1">
                          Instruksi / Catatan:
                        </div>
                        <p className="text-slate-600 whitespace-pre-line leading-relaxed">
                          {event.cleanDescription}
                        </p>
                      </div>
                    ) : (
                      <p className="text-slate-400 italic">
                        Tidak ada catatan tambahan untuk tugas ini.
                      </p>
                    )}

                    {event.links && event.links.length > 0 && (
                      <div>
                        <div className="font-semibold text-slate-700 mb-1">
                          Tautan Lampiran:
                        </div>
                        <ul className="space-y-1">
                          {event.links.map((link, idx) => (
                            <li key={idx}>
                              <a
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline flex items-center gap-1"
                              >
                                <span>{link.label}:</span>
                                <span className="truncate max-w-md">
                                  {link.url}
                                </span>
                                <ExternalLink className="w-3 h-3 shrink-0" />
                              </a>
                            </li>
                          ))}
                        </ul>
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
