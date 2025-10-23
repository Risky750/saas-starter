"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTemplateStore } from "@/stores/templateStore";
import { ChevronRight } from "lucide-react";

export default function ChooseWorkClient() {
  const router = useRouter();
  const { setCategory, setSelectedId, category } = useTemplateStore();

  const mapToInternal = (choice: "media" | "fashion" | "other") => {
    if (choice === "media" || choice === "fashion") return "portfolio" as const;
    return "website" as const;
  };

  const chooseUserCategory = (choice: "media" | "fashion" | "other") => {
    const internal = mapToInternal(choice);
    setCategory(internal);
    setSelectedId(null);
    if (choice === "media") router.push("/templates/media");
    else if (choice === "fashion") router.push("/templates/fashion");
    else router.push("/templates");
  };

  const skip = () => {
    setSelectedId(null);
    router.push("/pricing");
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-[#f5f2f0] p-6">
      <div className="w-full max-w-3xl">
        <h1 className="text-2xl font-bold text-[#2c1013] mb-4">Choose your work</h1>
        <p className="text-sm text-[#6e5659] mb-6">
          Pick the type of work you want to build. You can skip this step and choose later.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
          <Card
            className={`p-6 rounded-2xl cursor-pointer border ${
              category === "portfolio" ? "ring-2 ring-[#b23b44]/20" : "border-transparent"
            }`}
            onClick={() => chooseUserCategory("media")}
          >
            <h3 className="text-lg font-semibold">Media / Graphics</h3>
            <p className="text-sm text-[#6e5659] mt-2">For designers, studios and visual portfolios.</p>
            <div className="mt-4 flex justify-end">
              <Button variant="ghost" onClick={() => chooseUserCategory("media")}>
                Choose <ChevronRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </Card>

          <Card
            className={`p-6 rounded-2xl cursor-pointer border ${
              category === "portfolio" ? "ring-2 ring-[#b23b44]/20" : "border-transparent"
            }`}
            onClick={() => chooseUserCategory("fashion")}
          >
            <h3 className="text-lg font-semibold">Fashion Designer</h3>
            <p className="text-sm text-[#6e5659] mt-2">Showcase collections and lookbooks.</p>
            <div className="mt-4 flex justify-end">
              <Button variant="ghost" onClick={() => chooseUserCategory("fashion")}>
                Choose <ChevronRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </Card>

          <Card
            className={`p-6 rounded-2xl cursor-pointer border ${
              category === "website" ? "ring-2 ring-[#b23b44]/20" : "border-transparent"
            }`}
            onClick={() => chooseUserCategory("other")}
          >
            <h3 className="text-lg font-semibold">Other</h3>
            <p className="text-sm text-[#6e5659] mt-2">Business sites, stores and other use-cases.</p>
            <div className="mt-4 flex justify-end">
              <Button variant="ghost" onClick={() => chooseUserCategory("other")}>
                Choose <ChevronRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </Card>
        </div>

        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={skip} className="text-sm">
            Skip for now
          </Button>

          <div className="flex gap-3">
            <Button onClick={() => router.push("/pricing")}>Continue</Button>
          </div>
        </div>
      </div>
    </section>
  );
}
