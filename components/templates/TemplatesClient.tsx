"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { useTemplateStore } from "@/stores/templateStore";
import type { Template } from "@/types/templates";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function TemplatesClient({
  templatesByCategory,
}: {
  templatesByCategory: Record<string, Template[]>;
}) {
  const router = useRouter();
  const { selectedId, setSelectedId, selectedPreview, setSelectedPreview, category, setCategory } =
    useTemplateStore();

  const [localCategory, setLocalCategory] = useState<"website" | "portfolio">(
    category || "website"
  );

  useEffect(() => {
    setCategory(localCategory);
  }, [localCategory, setCategory]);

  const list = templatesByCategory[localCategory] || [];

  const pick = (template: Template) => {
    setSelectedId(template.id);
    setSelectedPreview?.(template.images?.[0] || "");
    router.push("/pricing");
  };

  const templatesBase = (process.env.NEXT_PUBLIC_TEMPLATES_BASE_URL || "").replace(/\/$/, "");

  const liveHref = (template: Template) => {
    const parts = template.id.split("/").filter(Boolean).map(encodeURIComponent).join("/");
    return templatesBase ? `${templatesBase}/${parts}` : `/demo/${parts}`;
  };

  return (
    <div className="min-h-screen bg-[#F4EFEA] text-[#7D141D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-3xl font-bold">Choose your template</h1>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Category Toggle */}
            <div className="relative flex items-center bg-white shadow-md rounded-full px-1 py-1 w-56 h-10 border border-[#e6d9d3] overflow-hidden">
              <div
                className={`absolute top-1 bottom-1 w-[48%] rounded-full bg-[#7D141D] transition-all duration-300 ease-in-out shadow-md ${
                  localCategory === "website" ? "left-1" : "left-[50%]"
                }`}
              />
              <button
                onClick={() => setLocalCategory("website")}
                className={`relative z-10 w-1/2 text-sm font-semibold transition-colors ${
                  localCategory === "website" ? "text-white" : "text-[#7D141D]"
                }`}
              >
                Website
              </button>
              <button
                onClick={() => setLocalCategory("portfolio")}
                className={`relative z-10 w-1/2 text-sm font-semibold transition-colors ${
                  localCategory === "portfolio" ? "text-white" : "text-[#7D141D]"
                }`}
              >
                Portfolio
              </button>
            </div>

            {/* Custom design button */}
            <Button
              onClick={() => router.push("/custom")}
              className="px-4 py-2 rounded-full bg-[#7D141D] shadow hover:shadow-md text-sm text-white transition"
            >
              Your own custom design
            </Button>
          </div>
        </div>

        {/* Template grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {list.map((template) => (
            <div
              key={template.id}
              className="group relative bg-white rounded-2xl shadow hover:shadow-lg transition cursor-pointer"
              onClick={() => pick(template)}
            >
              {template.images?.[0] ? (
                <div className="relative w-full h-52">
                  <Image
                    src={template.images[0]}
                    alt={template.title}
                    fill
                    className="object-cover rounded-t-2xl"
                  />
                </div>
              ) : (
                <div className="h-52 grid place-content-center text-gray-400 text-sm">
                  No preview
                </div>
              )}

              {/* Arrow icon */}
              <div className="absolute top-4 right-4 w-9 h-9 grid place-content-center rounded-full bg-[#7D141D] text-white opacity-0 group-hover:opacity-100 transition">
                <ChevronRight className="w-5 h-5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
