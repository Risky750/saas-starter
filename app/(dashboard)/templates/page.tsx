"use client";
import React, { useState, useEffect, useRef } from "react";
import { PortfolioPreview, WebsitePreview } from "@/components/ui/preview";
import { useTemplateStore } from "@/app/stores/templateStore";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { useRouter } from "next/navigation";

const templates = [
  {
    id: "portfolio",
    title: "Portfolio",
    desc: "Single-page portfolio for designers & developers.",
    preview: PortfolioPreview,
    images: [
      'https://images.unsplash.com/photo-1505685296765-3a2736de412f',
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
      'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5',
    ],
  },
  {
    id: "website",
    title: "Website",
    desc: "Multi-page business / startup site with blog & contact.",
    preview: WebsitePreview,
    images: [
      'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb',
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c',
    ],
  },
] as const;

export default function TemplatesPage() {
  const { selectedId, setSelectedId } = useTemplateStore();
  const selected = templates.find((t) => t.id === selectedId);
  // images for the selected template
  const images = selected?.images ?? [];
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [actualSize, setActualSize] = useState(false);
  const thumbsRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  const handleUseTemplate = () => {
    if (!selected) return;
    setSelectedId(selected.id);
    setLightboxOpen(false);
    // show toast then navigate
    setTimeout(() => {
      router.push(`/pricing?template=${encodeURIComponent(selected.id)}`);
    }, 700);
  };
  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowLeft') setCurrentIndex(i => Math.max(0, i - 1));
      if (e.key === 'ArrowRight') setCurrentIndex(i => Math.min(images.length - 1, i + 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxOpen, images.length]);

  useEffect(() => {
    // scroll thumbnail into view when currentIndex changes
    const container = thumbsRef.current;
    const el = container?.querySelector(`[data-idx=\"${currentIndex}\"]`) as HTMLElement | null;
    if (el && container) {
      const left = el.offsetLeft - container.clientWidth / 2 + el.clientWidth / 2;
      container.scrollTo({ left, behavior: 'smooth' });
    }
  }, [currentIndex]);

  // reset index when template changes
  useEffect(() => {
    setCurrentIndex(0);
    setLightboxOpen(false);
  }, [selected?.id]);

  return (
    <div className="min-h-screen bg-[#F4EFEA] text-[#7D141D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* HEADER */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl md:text-4xl font-bold">Choose your template</h1>
          {selected && (
            <button
              onClick={() => setSelectedId(null)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow hover:shadow-md transition"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
          )}
        </div>

        {/* GRID */}
        {!selected ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedId(t.id)}
                className="group relative bg-white rounded-2xl shadow hover:shadow-xl transition focus:outline-none focus:ring-4 focus:ring-[#FF1E27]/30"
              >
                <div className="p-6">
                  <t.preview />
                </div>
                <div className="px-6 pb-6 text-left">
                  <h2 className="text-xl font-semibold">{t.title}</h2>
                  <p className="text-sm text-[#7D141D]/70 mt-1">{t.desc}</p>
                </div>
                <div className="absolute top-4 right-4 w-10 h-10 grid place-items-center rounded-full bg-[#7D141D] text-white opacity-0 group-hover:opacity-100 transition">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </button>
            ))}
          </div>
        ) : (
          /* PREVIEW MODE */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-6 min-h-[60vh]">
              <selected.preview />
              {/* Image Preview Section */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Image Previews</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {images.map((url: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => { setCurrentIndex(idx); setLightboxOpen(true); setActualSize(false); }}
                      className="block w-full p-0 bg-transparent border-0 text-left"
                    >
                      <img
                        src={url}
                        alt={`Preview ${idx + 1}`}
                        className="w-full h-48 object-cover rounded-xl shadow"
                      />
                    </button>
                  ))}
                </div>
                {/* lightbox overlay */}
                {lightboxOpen && (
                  <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
                    <div className="max-w-[90vw] max-h-[90vh] w-full mx-4">
                      <div className="bg-white rounded-lg overflow-hidden">
                        <div className="p-3 flex items-center justify-between bg-gray-50">
                          <div className="text-sm text-gray-700">{currentIndex + 1} / {images.length}</div>
                          <div className="flex items-center gap-2">
                            <button
                              className="text-sm px-2 py-1 bg-gray-200 rounded"
                              onClick={() => setActualSize(s => !s)}
                            >{actualSize ? 'Fit' : 'Actual'}</button>
                            <button className="text-sm px-2 py-1 bg-[#FF1E27] text-white rounded" onClick={handleUseTemplate}>Use this template</button>
                            <button className="text-sm px-2 py-1 bg-gray-200 rounded" onClick={() => setLightboxOpen(false)}>Close</button>
                          </div>
                        </div>

                        <div className="relative bg-black flex items-center justify-center">
                          <button
                            onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
                            className="absolute left-2 top-1/2 -translate-y-1/2 text-white bg-black/30 p-2 rounded-full"
                            aria-label="Previous"
                          >
                            ‹
                          </button>

                          <div className={`mx-auto ${actualSize ? 'overflow-auto' : 'flex items-center justify-center'} max-h-[80vh]`}>
                            {actualSize ? (
                              <img src={images[currentIndex]} alt={`Large ${currentIndex+1}`} className="block" />
                            ) : (
                              <img src={images[currentIndex]} alt={`Large ${currentIndex+1}`} className="max-w-full max-h-[80vh] object-contain" />
                            )}
                          </div>

                          <button
                            onClick={() => setCurrentIndex(i => Math.min(images.length - 1, i + 1))}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-white bg-black/30 p-2 rounded-full"
                            aria-label="Next"
                          >
                            ›
                          </button>
                        </div>

                        <div className="p-3 bg-white">
                          <div ref={thumbsRef} className="flex gap-2 overflow-x-auto py-1">
                            {images.map((u: string, i: number) => (
                              <button
                                key={i}
                                data-idx={i}
                                onClick={() => setCurrentIndex(i)}
                                className={`flex-none rounded overflow-hidden border ${i === currentIndex ? 'ring-2 ring-[#FF1E27]' : 'border-transparent'}`}
                              >
                                <img src={u} alt={`thumb ${i+1}`} className="h-16 w-28 object-cover" />
                              </button>
                            ))}
                          </div>
                          <div className="mt-3 flex justify-end">
                            <button className="px-3 py-1 bg-[#FF1E27] text-white rounded" onClick={handleUseTemplate}>Select this template</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6 self-start">
              <h2 className="text-2xl font-bold mb-2">{selected.title}</h2>
              <p className="text-[#7D141D]/80 mb-6">{selected.desc}</p>

              <Button
                onClick={() => {
                  router.push('/pricing');
                }}
                className="w-full"
              >
                Use this template
              </Button>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// auto-hide toast
const _toastCleanup = () => {};