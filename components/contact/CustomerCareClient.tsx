"use client";
import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function CustomerCareClient() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const templateId = searchParams?.get('template') ?? '';

  useEffect(() => {
    // If no template param, we can optionally do something here.
  }, [templateId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    // include templateId if present
    if (templateId) formData.set('templateId', templateId);

    const res = await fetch('/api/contact', {
      method: 'POST',
      body: JSON.stringify(Object.fromEntries(formData)),
      headers: { 'Content-Type': 'application/json' },
    });

    setLoading(false);
    if (res.ok) setSent(true);
  };

  return (
    <Card className="p-6 lg:p-8 rounded-2xl shadow-lg">
      <h1 className="text-2xl font-bold mb-2">Contact</h1>
      <p className="mb-6 text-[#7D141D]/80">You will be contacted when we see your message</p>

      {sent ? (
        <p className="text-green-700">✓ Request sent. We’ll reply shortly.</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input name="name" placeholder="Your name" required />
          <Input name="email" type="email" placeholder="Email address" required />
          <Input name="phone" placeholder="Phone (optional)" />
          <Textarea name="message" placeholder="let us know your needs" rows={6} required />
          <input type="hidden" name="templateId" value={templateId} />
          <div className="flex gap-2">
            <Button type="submit" className="rounded-full bg-[#7D141D] text-white" disabled={loading}>
              {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : 'Send '}
            </Button>
          </div>
        </form>
      )}

      <Button
        onClick={() => router.push("https://wa.me/2349012065117")}
        variant="outline"
        className="mt-2 flex flex-col bg-green-400 justify-center rounded-full hover:bg-green-50">
        Contact us on WhatsApp
      </Button>

    </Card>
  );
}
