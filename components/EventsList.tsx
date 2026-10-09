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
  FileCheck2,
  HelpCircle,
  AlertTriangle,
} from "lucide-react";
import type { OaseEvent, OaseEventType } from "@/types/calendar";

interface EventsListProps {
  events: OaseEvent[];
  isLoading: boolean;
  onRefresh: () => void;
}

export function EventsList({ events, isLoading, onRefresh }: EventsListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<OaseEventType | "all">(
    "all",
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filter & Search
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      // Filter tipe
      if (selectedType !== "all" && ev.eventType !== selectedType) {
        return false;
      }

      // Filter search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = ev.cleanTitle.toLowerCase().includes(query);
        const matchCourse = ev.courseName.toLowerCase().includes(query);
        const matchDesc = ev.cleanDescription.toLowerCase().includes(query);
        return matchTitle || matchCourse || matchDesc;
      }

      return true;
    });
  }, [events, selectedType, searchQuery]);

  const toggleExpand = (uid: string) => {
    setExpandedId((prev) => (prev === uid ? null : uid));
  };

  // Badge jenis kegiatan
  const getTypeBadge = (type: OaseEventType) => {
    switch (type) {
      case "assignment":
        return (
          <span className="inline-flex items-center gap-1 text-sm font-semibold px-2 py-0.5 rounded bg-blue-50 text-[#2c49b6] border border-blue-200">
            <FileCheck2 className="w-3 h-3" /> Tugas
          </span>
        );
      case "quiz":
        return (
          <span className="inline-flex items-center gap-1 text-sm font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
            <HelpCircle className="w-3 h-3" /> Kuis
          </span>
        );
      case "exam":
        return (
          <span className="inline-flex items-center gap-1 text-sm font-semibold px-2 py-0.5 rounded bg-rose-50 text-[#dc3545] border border-rose-200">
            <AlertTriangle className="w-3 h-3" /> Ujian (UTS/UAS)
          </span>
        );
      case "discussion":
        return (
          <span className="inline-flex items-center gap-1 text-sm font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
            Diskusi
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center text-sm font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
            Akademik
          </span>
        );
    }
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
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-5">
      {/* Header Preview & Counter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#2c49b6]" />
            <span>Daftar Agenda & Tugas OASE</span>
            <span className="text-sm font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              {events.length} Terdeteksi
            </span>
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Daftar tugas, kuis, dan ujian yang diparsing dari export kalender
            Moodle Anda.
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 text-sm text-[#2c49b6] hover:text-[#001d62] font-semibold self-start sm:self-auto py-1 px-2.5 rounded hover:bg-blue-50 transition-colors"
        >
          <Clock className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>Muat Ulang Kalender</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari mata kuliah, nama tugas, atau kuis..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#2c49b6] focus:border-[#2c49b6]"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-sm">
          {(
            [
              { key: "all", label: "Semua" },
              { key: "assignment", label: "Tugas" },
              { key: "quiz", label: "Kuis" },
              { key: "exam", label: "Ujian" },
            ] as const
          ).map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setSelectedType(item.key)}
              className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
                selectedType === item.key
                  ? "bg-[#2c49b6] text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* List Items */}
      {isLoading ? (
        <div className="py-12 text-center text-slate-400 space-y-2">
          <div className="w-6 h-6 border-2 border-[#2c49b6] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm">
            Sedang memuat dan memparsing jadwal dari OASE UNUD...
          </p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="py-12 text-center text-slate-400 space-y-2 border border-dashed border-slate-200 rounded-lg">
          <BookOpen className="w-8 h-8 mx-auto text-slate-300" />
          <p className="text-sm font-medium text-slate-600">
            Tidak ada agenda yang ditemukan
          </p>
          <p className="text-sm text-slate-400">
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
                      {getTypeBadge(event.eventType)}
                      <span className="text-sm font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
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
