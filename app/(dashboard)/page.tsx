
"use client";
import React from "react";
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ArrowRight, CreditCard, Database } from 'lucide-react';

export default function HomePage() {
  const [showModal, setShowModal] = React.useState(true);
  const [dontShowAgain, setDontShowAgain] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState("");
  const [error, setError] = React.useState("");
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setSuccess("User registered successfully!");
        setEmail("");
        setShowModal(false);
        if (dontShowAgain) {
          try { localStorage.setItem('register_dont_show', '1'); } catch {}
        }
      } else {
        const data = await res.json();
        setError(data.error || "Registration failed");
      }
    } catch (err) {
      setError("Network error");
    }
    setLoading(false);
  };

  // Respect stored preference on mount
  React.useEffect(() => {
    try {
      const v = localStorage.getItem('register_dont_show');
      if (v === '1') setShowModal(false);
    } catch {}
  }, []);

  return (
    <>
      <div className="p-4">
        {success && <p className="text-green-500 mt-2">{success}</p>}
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>
      <main className="bg-[#F4EFEA] text-[#7D141D]">
        {/* ---------- HERO ---------- */}
        <section className="py-20 lg:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              {/* copy */}
              <div className="text-center lg:text-left">
                <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">
                  Build Your Website
                  <span className="block text-[#FF1E27]">Faster Than Ever</span>
                </h1>
                <p className="mt-4 text-lg lg:text-xl text-[#7D141D]/80">
                  Launch your website in record time—quality work at affordable prices.
                </p>
                <div className="mt-8">
                  <Button
                    size="lg"
                    className="rounded-full bg-[#7D141D] text-white hover:bg-[#FF1E27] transition"
                    onClick={() => router.push('/templates')}
                  >
                    Get started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>

              <div className="relative w-full aspect-square lg:aspect-auto lg:w-full">
                <Image
                  alt='group icon'
                  src="/images/Group1.svg"
                  height={800}
                  width={800}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ---------- FEATURES ---------- */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-3 gap-8">
            {[{
              icon: <Database className="h-6 w-6" />,
              title: 'Professional Website & Portfolios',
              text: 'Leverage modern web technologies to create a stunning online presence.',
            }, {
              icon: <CreditCard className="h-6 w-6" />,
              title: 'Email Hosting & Online Blogs',
              text: 'Different services to choose from, depending on your needs.',
            }, {
              icon: (
                <svg viewBox="0 0 24 24" className="h-6 w-6">
                  <path
                    fill="currentColor"
                    d="M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236…"
                  />
                </svg>
              ),
              title: 'Fast Delivery and Affordable Prices',
              text: 'Get the best value for your money with our competitively priced services.',
            }].map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 shadow-md">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-[#FF1E27] text-white mb-4">
                  {f.icon}
                </div>
                <h3 className="text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-[#7D141D]/70">{f.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ---------- CTA ---------- */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold">Ready to launch your website?</h2>
              <p className="mt-2 text-[#7D141D]/80">
                Start today and experience quality, speed and satisfaction.
              </p>
            </div>
            <Button
              size="lg"
              className="rounded-full bg-[#FF1E27] text-white hover:bg-[#FF1E27]/90 transition"
              onClick={() => router.push('/templates')}
            >
              Start a Project
              <ArrowRight className="ml-3 h-6 w-6" />
            </Button>
          </div>
        </section>
      </main>
      {showModal && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-80">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold">Register your email</h3>
                <p className="text-sm text-[#7D141D]/70 mt-1">Register to save preferences and receive updates. This is optional.</p>
              </div>
              <button
                aria-label="Dismiss"
                className="ml-4 text-gray-500 hover:text-gray-700"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegister} className="mt-4 space-y-3">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter email"
                required
                className="w-full px-3 py-2 border rounded"
              />

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={dontShowAgain}
                    onChange={e => setDontShowAgain(e.target.checked)}
                  />
                  Don't show again
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                    onClick={() => setShowModal(false)}
                  >Skip</button>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-[#FF1E27] text-white rounded hover:bg-[#7D141D] text-sm"
                    disabled={loading}
                  >{loading ? 'Registering...' : 'Register'}</button>
                </div>
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}
            </form>
          </div>
        </div>
      )}
    </>
  );
}