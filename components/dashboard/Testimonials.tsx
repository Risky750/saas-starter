import React from "react";
import { Testimonial } from "@/types/testimonial";

const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Amaka",
    title: "Bakery Owner",
    quote:
      "CraftmyWeb honestly made things way easier. I don’t worry about my site anymore and my orders literally doubled in a month.",
    avatar: null,
  },
  {
    id: "2",
    name: "Kofi",
    title: "Photographer",
    quote:
      "I’m not really a tech person, but the templates just worked. My portfolio finally looks legit and clients now book straight through it.",
    avatar: null,
  },
  {
    id: "3",
    name: "Lola",
    title: "Consultant",
    quote:
      "The setup was quick and support actually helped me pick the right layout. It felt personal, not just automated.",
    avatar: null,
  },
];

export default function Testimonials() {
  return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-semibold text-[#7D141D] mb-8 text-center">
          What people are saying
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <div key={t.id} className="bg-white p-5 rounded-xl shadow-md">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-[#F4EFEA] flex items-center justify-center text-[#7D141D] font-bold">
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-[#7D141D]/70">{t.title}</p>
                </div>
              </div>
              <p className="text-sm italic text-gray-700">“{t.quote}”</p>
            </div>
          ))}
        </div>
      </div>
  );
}
