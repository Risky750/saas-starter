"use client";
import React, { useState, useEffect, useRef } from "react";
import { useTemplateStore } from "@/app/stores/templateStore";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { Template } from "types/templates";

export default function TemplatesClient({ templatesByCategory }: { templatesByCategory: Record<string, Template[]> }) {
  const { selectedId, setSelectedId, setSelectedPreview } = useTemplateStore();
  const [category, setCategory] = useState<string>("website");
  const templates = templatesByCategory[category] ?? [];
  const selected = templates.find((t) => t.id === selectedId);
  const images = selected?.images ?? [];
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [actualSize, setActualSize] = useState(false);
  const thumbsRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  const handleUseTemplate = () => {
    if (!selected) return;
    setSelectedId(selected.id);
    if (setSelectedPreview) setSelectedPreview(selected.images?.[0] ?? null);
    setLightboxOpen(false);
    setTimeout(() => {
      router.push("/pricing");
    }, 700);
  };

  useEffect(() => {
    if (selected) {
      setCurrentIndex(0);
      setLightboxOpen(true);
    }
  }, [selected?.id]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowLeft") setCurrentIndex((i) => Math.max(0, i - 1));
      if (e.key === "ArrowRight") setCurrentIndex((i) => Math.min(images.length - 1, i + 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen, images.length]);

  useEffect(() => {
    const container = thumbsRef.current;
    const el = container?.querySelector(`[data-idx="${currentIndex}"]`) as HTMLElement | null;
    if (el && container) {
      const left = el.offsetLeft - container.clientWidth / 2 + el.clientWidth / 2;
      container.scrollTo({ left, behavior: "smooth" });
    }
  }, [currentIndex]);

  return (
    <div className="min-h-screen bg-[#F4EFEA] text-[#7D141D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Choose your template</h1>
          <div className="flex flex-wrap items-center gap-3">
            {/* Category Switch */}
            <div className="bg-white rounded-full shadow px-2 py-1 flex gap-2">
              <button
                onClick={() => setCategory("website")}
                className={`px-3 py-1 rounded-full ${
                  category === "website" ? "bg-[#7D141D] text-white" : "text-[#7D141D]"
                }`}
              >
                Website
              </button>
              <button
                onClick={() => setCategory("portfolio")}
                className={`px-3 py-1 rounded-full ${
                  category === "portfolio" ? "bg-[#7D141D] text-white" : "text-[#7D141D]"
                }`}
              >
                Portfolio
              </button>
            </div>

            {/* Custom design CTA */}
            <button
              onClick={() => {
                if (selected) setSelectedId(selected.id);
                router.push("/custom");
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow hover:shadow-md transition text-sm sm:text-base"
            >
              Your own custom design
            </button>
          </div>
        </div>

        {/* Template grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {templates.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setSelectedId(t.id);
                if (setSelectedPreview) setSelectedPreview(t.images?.[0] ?? null);
                setCurrentIndex(0);
                setLightboxOpen(true);
              }}
              className="group relative bg-white rounded-2xl shadow hover:shadow-xl transition focus:outline-none focus:ring-4 focus:ring-[#FF1E27]/30"
            >
              <div>
                {t.images && t.images.length > 0 ? (
                  <div className="w-full h-44 sm:h-52 overflow-hidden rounded-t-2xl">
                    <img src={t.images[0]} alt={`${t.title} preview`} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-full h-44 sm:h-52 bg-gray-100 grid place-items-center rounded-t-2xl">
                    <span className="text-sm text-gray-500">No preview</span>
                  </div>
                )}
              </div>
              <div className="absolute top-4 right-4 w-10 h-10 grid place-items-center rounded-full bg-[#7D141D] text-white opacity-0 group-hover:opacity-100 transition">
                <ChevronRight className="w-5 h-5" />
              </div>
            </button>
          ))}
        </div>

        {/* Lightbox */}
        {lightboxOpen && selected && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
            <div className="max-w-2xl max-h-[70vh] w-full flex items-center justify-center mx-auto">
              <div className="bg-white rounded-lg overflow-hidden shadow-lg">
                {/* Header bar */}
                <div className="p-3 flex items-center justify-between bg-gray-50">
                  <div className="text-sm text-gray-700">{currentIndex + 1} / {images.length}</div>
                  <div className="flex items-center gap-2">
                    <button
                      className="text-sm px-2 py-1 bg-gray-200 rounded"
                      onClick={() => setActualSize((s) => !s)}
                    >
                      {actualSize ? "Fit" : "Actual"}
                    </button>
                    <button
                      className="text-sm px-2 py-1 bg-gray-200 rounded"
                      onClick={() => {
                        setLightboxOpen(false);
                        setSelectedId(null);
                      }}
                    >
                      Close
                    </button>
                  </div>
                </div>

                {/* Main image area */}
                <div className="relative bg-black flex items-center justify-center">
                  <button
                    onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                    className="absolute left-2 top-1/2 -translate-y-1/2 text-white bg-black/30 p-2 rounded-full"
                    aria-label="Previous"
                  >
                    ‹
                  </button>

                  <div className={`mx-auto ${actualSize ? "overflow-auto" : "flex items-center justify-center"} max-h-[70vh] sm:max-h-[80vh]`}>
                    {actualSize ? (
                      <img src={images[currentIndex]} alt={`Large ${currentIndex + 1}`} className="block" />
                    ) : (
                      <img
                        src={images[currentIndex]}
                        alt={`Large ${currentIndex + 1}`}
                        className="max-w-full max-h-[70vh] sm:max-h-[80vh] object-contain"
                      />
                    )}
                  </div>

                  <button
                    onClick={() => setCurrentIndex((i) => Math.min(images.length - 1, i + 1))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-white bg-black/30 p-2 rounded-full"
                    aria-label="Next"
                  >
                    ›
                  </button>
                </div>

                {/* Thumbnails */}
                <div className="p-3 bg-white">
                  <div ref={thumbsRef} className="flex gap-2 overflow-x-auto py-1 scrollbar-thin scrollbar-thumb-gray-300">
                    {images.map((u: string, i: number) => (
                      <button
                        key={i}
                        data-idx={i}
                        onClick={() => setCurrentIndex(i)}
                        className={`flex-none rounded overflow-hidden border ${
                          i === currentIndex ? "ring-2 ring-[#FF1E27]" : "border-transparent"
                        }`}
                      >
                        <img src={u} alt={`thumb ${i + 1}`} className="h-16 w-28 object-cover" />
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 flex justify-end">
                    <button className="px-3 py-1 bg-[#FF1E27] text-white rounded" onClick={handleUseTemplate}>
                      Select this template
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
