"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Glasses, Handshake, Globe, ArrowRight,MessageCircle } from "lucide-react";
import Testimonials from "@/components/dashboard/Testimonials";

export default function HomePage() {
  const push = useRouter().push;

  return (
    <main className="bg-[#F4EFEA] text-[#7D141D]">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <p className="text-2xl font-bold tracking-tight">CraftmyWeb</p>
          <Button variant="outline" onClick={() => push("/contact")}>
            Contact Us
          </Button>
        </div>
      </header>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 grid gap-10 lg:grid-cols-2 items-center">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
              From Google to socials — your reach has no limits
            </h1>
            <p className="mt-4 text-lg text-[#7D141D]/80">
              A polished digital presence proves your skills and credibility at first glance.
            </p>
            <Button
              size="lg"
              className="mt-8 rounded-full bg-[#7D141D] text-white hover:bg-[#FF1E27]"
              onClick={() => push("/work")}
            >
             <p className="text-lg"> Get your website now</p><ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          <div className="relative w-full aspect-square">
            <Image src="/images/Group1.svg" alt="Hero illo" fill className="object-contain" />
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-8">
          {[
            { icon: Glasses, title: "Show up everywhere", text: "Be found on Google, social media, and beyond." },
            { icon: Handshake, title: "Build instant trust", text: "Your online presence speaks for you." },
            { icon: Globe, title: "Attract more opportunities", text: "More visibility = more clients and jobs." },
          ].map((b) => (
            <div key={b.title} className="bg-white p-6 rounded-2xl shadow">
              <div className="h-12 w-12 grid place-content-center rounded-full bg-[#FF1E27] text-white mb-4">
                <b.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold">{b.title}</h3>
              <p className="mt-2 text-sm text-[#7D141D]/70">{b.text}</p>
            </div>
          ))}
        </div>
      </section>

      <Testimonials />

     <section className="py-16">
  <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
    <div className="text-center md:text-left">
      <h2 className="text-3xl lg:text-4xl font-bold mb-3">
        The premium touch your brand deserves.
      </h2>
      <p className="text-lg text-gray-600 max-w-xl">
        Elevate your presence with designs crafted for impact and credibility.
      </p>
    </div>

    <Button
      size="lg"
      className="rounded-full bg-[#FF1E27] text-white hover:bg-[#FF1E27]/90 shadow-lg transition transform hover:scale-105"
      onClick={() => push("/custom")}
    >
      Custom Design <ArrowRight className="ml-2 h-5 w-5" />
    </Button>
  </div>
</section>


      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-sm text-[#7D141D]/60">
          © {new Date().getFullYear()} CraftmyWeb.Ng – All rights reserved.
        </div>
      </footer>
<a
  href="https://wa.me/2348012345678"
  className="fixed bottom-6 right-6 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform z-50"
>
  <MessageCircle className="h-6 w-6" />
</a>

    </main>
  );
}