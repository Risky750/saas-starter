'use client';
import { useState } from 'react';
import Link from 'next/link';



export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex flex-col min-h-screen">
      <main className="flex-1">{children}</main>


    </section>
  );
};
