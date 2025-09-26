"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { GlassesIcon, HandshakeIcon, Globe, ArrowRight } from "lucide-react";
import Testimonials from "@/components/dashboard/Testimonials";

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="bg-[#F4EFEA] text-[#7D141D]">
          <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <p className="text-2xl font-bold text-[#7D141D] tracking-tight">
            CraftmyWeb
          </p>
        </div>
      </div>
    </header>
      {/* HERO */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 grid gap-10 lg:grid-cols-2 items-center">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
             From Google to socials — your reach has no limits
            </h1>
            <p className="mt-4 text-lg text-[#7D141D]/80">
   A polished digital presence proves your skills and credibility at first glance.            </p>

            <Button
              size="lg"
              className="mt-8 rounded-full bg-[#7D141D] text-white hover:bg-[#FF1E27]"
              onClick={() => router.push("/templates")}
            >
              Get started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          <div className="relative w-full aspect-square">
            <Image
              src="/images/Group1.svg"
              alt="Happy group illustration"
              fill
              className="object-contain"
            />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl shadow">
            <div className="h-12 w-12 flex items-center justify-center rounded-full bg-[#FF1E27] text-white mb-4">
              <GlassesIcon className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold">Show up everywhere</h3>
            <p className="mt-2 text-sm text-[#7D141D]/70">
             Be found on Google, social media, and beyond — wherever your audience looks.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow">
            <div className="h-12 w-12 flex items-center justify-center rounded-full bg-[#FF1E27] text-white mb-4">
              <HandshakeIcon className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold">Build instant trust</h3>
            <p className="mt-2 text-sm text-[#7D141D]/70">
            Your online presence speaks for you — make sure it builds trust instantly.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow">
            <div className="h-12 w-12 flex items-center justify-center rounded-full bg-[#FF1E27] text-white mb-4">
              <Globe className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold">Attract more opportunities</h3>
            <p className="mt-2 text-sm text-[#7D141D]/70">
              More visibility means more clients, jobs, and collaborations knocking on your door.
            </p>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <Testimonials />

      {/* FOOTER CTA */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <h2 className="text-3xl lg:text-4xl font-bold text-center md:text-left">
            Want something one-of-a-kind?
          </h2>
          <Button
            size="lg"
            className="rounded-full bg-[#FF1E27] text-white hover:bg-[#FF1E27]/90"
            onClick={() => router.push("/custom")}
          >
            Custom Design
            <ArrowRight className="ml-3 h-6 w-6" />
          </Button>
        </div>
      </section>
            <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-sm text-[#7D141D]/60">
          © {new Date().getFullYear()} Craft my Web.Ng – All rights reserved.
        </div>
      </footer>
    </main>
  );
}
