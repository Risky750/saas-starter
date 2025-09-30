'use client';import Link from 'next/link';



export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex flex-col min-h-screen">
      <main className="flex-1">{children}</main>


    </section>
  );
};
