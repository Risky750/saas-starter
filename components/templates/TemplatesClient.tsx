"use client";

import React, { useEffect, useRef, useState, useReducer } from "react";
import { useRouter } from "next/navigation";
import { XIcon, ChevronRight } from "lucide-react";
import { useTemplateStore } from "@/stores/templateStore";
import type { Template } from "types/templates";
import { Button } from "@/components/ui/button";

export default function TemplatesClient({
  templatesByCategory,
}: {
  templatesByCategory: Record<string, Template[]>;
}) {
  const router = useRouter();
  const { selectedId, setSelectedId, setSelectedPreview } = useTemplateStore();

  const [category, setCategory] = useState<"website" | "portfolio">("website");
  const [lightbox, setLightbox] = useState(false);
  const [actualSize, toggleActualSize] = useReducer((s) => !s, false);

  const thumbsWrap = useRef<HTMLDivElement>(null);

  const list = templatesByCategory[category] || [];
  const active = list.find((t) => t.id === selectedId);

  /* close on Escape */
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setLightbox(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox]);

  /* scroll thumbs into view */
  useEffect(() => {
    const wrap = thumbsWrap.current;
    const node = wrap?.querySelector(`[data-i="0"]`) as HTMLElement;
    if (!wrap || !node) return;
    wrap.scrollLeft = node.offsetLeft - wrap.clientWidth / 2 + node.clientWidth / 2;
  }, [active?.id]);

  const pick = (t: Template) => {
    setSelectedId(t.id);
    setSelectedPreview?.(t.images?.[0] || "");
    setLightbox(true);
  };

  const confirm = () => {
    if (!active) return;
    setSelectedId(active.id);
    setSelectedPreview?.(active.images?.[0] || "");
    setLightbox(false);
    setTimeout(() => router.push("/pricing"), 700);
  };

  return (
    <div className="min-h-screen bg-[#F4EFEA] text-[#7D141D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-3xl font-bold">Choose your template</h1>
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-full shadow px-1 py-1 flex gap-1">
              <Button
                onClick={() => setCategory("website")}
                className={`px-3 py-1 rounded-full text-sm ${
                  category === "website" ? "bg-[#7D141D] text-white" : ""
                }`}
              >
                Website
              </Button>
              <Button
                onClick={() => setCategory("portfolio")}
                className={`px-3 py-1 rounded-full text-sm ${
                  category === "portfolio" ? "bg-[#7D141D] text-white" : ""
                }`}
              >
                Portfolio
              </Button>
            </div>

            <Button
              onClick={() => {
                if (active) setSelectedId(active.id);
                router.push("/custom");
              }}
              className="px-4 py-2 rounded-full bg-[#7D141D] shadow hover:shadow-md text-sm"
            >
              Your own custom design
            </Button>
          </div>
        </div>

        {/* grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {list.map((t) => (
            <button
              key={t.id}
              onClick={() => pick(t)}
              className="group relative bg-white rounded-2xl shadow hover:shadow-lg transition"
            >
              {t.images?.[0] ? (
                <img
                  src={t.images[0]}
                  alt={t.title}
                  className="w-full h-52 object-cover rounded-t-2xl"
                />
              ) : (
                <div className="h-52 grid place-content-center text-gray-400 text-sm">No preview</div>
              )}
              <div className="absolute top-4 right-4 w-9 h-9 grid place-content-center rounded-full bg-[#7D141D] text-white opacity-0 group-hover:opacity-100 transition">
                <ChevronRight className="w-5 h-5" />
              </div>
            </button>
          ))}
        </div>

        {/* lightbox */}
        {lightbox && active && (
          <div className="fixed inset-0 z-40 bg-black/70 grid place-content-center p-4">
            <div className="bg-white rounded-lg overflow-hidden shadow-xl w-full max-w-3xl">
              {/* top bar */}
              <div className="px-4 py-3 bg-gray-50 flex items-center justify-end text-sm">
                <Button
                  onClick={() => {
                    setLightbox(false);
                    setSelectedId(null);
                  }}
                  className="px-2 py-1 bg-gray-600 rounded"
                >
                  <XIcon className="w-4 h-4" />
                </Button>
              </div>

              {/* main image */}
              <div className="relative bg-black grid place-content-center">
                <div className={`mx-auto ${actualSize ? "overflow-auto" : ""}`}>
                  <img
                    src={active.images?.[0] || ""}
                    alt={active.title}
                    className={`block ${actualSize ? "" : "max-w-full max-h-[70vh] object-contain"}`}
                  />
                </div>
              </div>

              {/* thumbs + CTA */}
              <div className="p-4 bg-white">
                <div
                  ref={thumbsWrap}
                  className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300"
                >
                  {active.images?.map((src, i) => (
                    <Button
                      key={i}
                      data-i={i}
                      onClick={() => {
                        setSelectedPreview?.(src);
                        /* re-render main img */
                      }}
                      className={`shrink-0 rounded overflow-hidden border-2 ${
                        src === active.images?.[0] ? "border-[#FF1E27]" : "border-transparent"
                      }`}
                    >
                      <img src={src} alt="" className="h-16 w-28 object-cover" />
                    </Button>
                  ))}
                </div>

                <div className="mt-3 flex justify-end">
                  <Button onClick={confirm} className="px-4 py-2 bg-[#FF1E27] text-white rounded">
                    Select this template
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}