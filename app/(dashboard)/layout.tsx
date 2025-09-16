'use client';
import { useState } from 'react';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function Header() {
  const [open, setOpen] = useState(false);

  const navLinks = [
   
    { label: 'Pricing', href: '/pricing' },
    { label: 'Contact', href: '/contact' },];

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-[#7D141D] tracking-tight">
            CraftmyWeb.Ng
          </Link>

          {/* Desktop Nav + CTA */}
          <div className="hidden md:flex md:items-center md:gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[#7D141D]/80 hover:text-[#FF1E27] transition"
              >
                {link.label}
              </Link>
            ))}
          </div>

          
          <button
            className="md:hidden p-2 rounded-md text-[#7D141D] hover:bg-[#F4EFEA] focus:outline-none"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            open ? 'max-h-96' : 'max-h-0'
          }`}
        >
          <nav className="flex flex-col gap-4 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-[#7D141D]/80 hover:text-[#FF1E27] transition"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex flex-col min-h-screen bg-[#F4EFEA]">
      <Header />
      <main className="flex-1">{children}</main>

      {/* Simple footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-sm text-[#7D141D]/60">
          © {new Date().getFullYear()} Craft my Web.Ng – All rights reserved.
        </div>
      </footer>
    </section>
  );
}