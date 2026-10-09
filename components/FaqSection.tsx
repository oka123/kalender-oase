"use client";

import React, { useState } from "react";
import { HelpCircle, ChevronDown, Sparkles } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: "Apa itu Kalender OASE Universitas Udayana?",
    answer:
      "Kalender OASE adalah aplikasi utilitas sumber terbuka yang menghubungkan sistem pembelajaran daring OASE Moodle Universitas Udayana ke Google Calendar. Aplikasi ini mengekstrak feed iCal resmi untuk menyinkronkan jadwal tugas, kuis, dan ujian secara otomatis dan terjadwal.",
  },
  {
    question: "Bagaimana cara mendapatkan URL Kalender dari OASE UNUD?",
    answer:
      "Masuk ke portal OASE UNUD (oase.unud.ac.id), buka menu Calendar di sidebar, klik 'Import or export calendars', pilih 'Export calendar', tentukan 'All events' dan periode 'Recent and next 60 days', lalu klik 'Get calendar URL' untuk menyalin link ekspor iCal Anda.",
  },
  {
    question: "Apakah sinkronisasi kalender OASE ini aman dan menjaga privasi?",
    answer:
      "Sangat aman. Aplikasi menerapkan arsitektur stateless tanpa database pengguna terpusat. Kredensial Google disimpan dalam cookie terenkripsi kuat menggunakan algoritma AES-256-GCM pada peramban Anda. Kami tidak pernah menyimpan kata sandi OASE maupun akun Google Anda.",
  },
  {
    question: "Bisakah kalender OASE tersinkronisasi otomatis tanpa harus buka web setiap hari?",
    answer:
      "Bisa. Anda dapat mengaktifkan GitHub Actions gratis menggunakan workflow webhook yang telah kami sediakan di menu 'Otomatisasi GitHub'. GitHub Actions akan memicu sinkronisasi kalender setiap hari secara terjadwal di latar belakang.",
  },
  {
    question: "Apakah jadwal kuliah di Google Calendar akan bertumpuk atau terduplikasi?",
    answer:
      "Tidak. Sistem sinkronisasi bersifat idempoten dan cerdas. Agenda yang sudah ada akan diperbarui jika terjadi revisi waktu dari dosen, agenda baru akan ditambahkan, dan agenda lama yang tidak berubah tidak akan diduplikasi.",
  },
  {
    question: "Apakah aplikasi ini resmi dibuat oleh pihak Universitas Udayana?",
    answer:
      "Aplikasi ini merupakan proyek independen sumber terbuka yang dikembangkan oleh mahasiswa untuk membantu sivitas akademika Universitas Udayana. Aplikasi ini tidak berafiliasi resmi secara komersial dengan Universitas Udayana maupun Google LLC.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  // Structured Data JSON-LD untuk FAQPage
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <section className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 sm:p-8 space-y-6">
      {/* Script JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold border border-blue-200">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Tanya Jawab &amp; Panduan</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Pertanyaan yang Sering Diajukan (FAQ)
          </h2>
          <p className="text-sm text-slate-500">
            Jawaban lengkap seputar penggunaan dan keamanan sinkronisasi kalender OASE UNUD.
          </p>
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div key={idx} className="py-4 first:pt-0 last:pb-0">
              <button
                type="button"
                onClick={() => toggleFaq(idx)}
                className="w-full flex items-center justify-between gap-4 text-left group focus:outline-hidden"
                aria-expanded={isOpen}
              >
                <span className="text-base font-semibold text-slate-900 group-hover:text-[#001d62] transition-colors flex items-center gap-2.5">
                  <HelpCircle className="w-4 h-4 text-slate-400 group-hover:text-[#001d62] shrink-0" />
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-slate-400 group-hover:text-slate-600 shrink-0 transition-transform duration-200 ${
                    isOpen ? "rotate-180 text-[#001d62]" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="mt-3 pl-6 pr-2 text-sm text-slate-600 leading-relaxed animate-in fade-in duration-150">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
