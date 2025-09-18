'use client';
import { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Card } from '../../../components/ui/card';
import { Mail, Phone, MapPin, Loader2, } from 'lucide-react';

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = await fetch('/api/contact', {
      method : 'POST',
      body   : JSON.stringify(Object.fromEntries(formData)),
      headers: { 'Content-Type': 'application/json' },
    });
    setLoading(false);
    if (res.ok) setSent(true);
  };

  return (
    <main className="min-h-screen bg-[#F4EFEA] text-[#7D141D] px-4 py-16">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10">
        {/* LEFT: FORM */}
        <Card className="p-6 lg:p-8 rounded-2xl shadow-lg">
          <h1 className="text-3xl font-bold mb-2">Get in touch</h1>
          <p className="mb-6 text-[#7D141D]/80">We’d love to hear from you.</p>

          {sent ? (
            <p className="text-green-700">✓ Message sent. We’ll reply shortly.</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input name="name" placeholder="Your name" required />
              <Input name="email" type="email" placeholder="Email address" required />
              <Textarea name="message" placeholder="Your message" rows={5} required />
              <Button
                type="submit"
                className="w-full rounded-full bg-[#7D141D] text-white hover:bg-[#FF1E27] transition"
                disabled={loading}
              >
                {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : 'Send message'}
              </Button>
            </form>
          )}
        </Card>

        {/* RIGHT: INFO */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Contact info</h2>

          <div className="flex items-start gap-4">
            <Mail className="mt-1 text-[#FF1E27]" size={20} />
            <div>
              <p className="font-medium">Email</p>
              <a href="mailto:hello@craftmyweb.ng" className="text-sm text-[#7D141D]/80 hover:underline">
                hello@craftmyweb.ng
              </a>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <Phone className="mt-1 text-[#FF1E27]" size={20} />
            <div>
              <p className="font-medium">Phone</p>
              <a href="tel:+2349012345678" className="text-sm text-[#7D141D]/80 hover:underline">
                +234 901 234 5678
              </a>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <MapPin className="mt-1 text-[#FF1E27]" size={20} />
            <div>
              <p className="font-medium">Office</p>
              <p className="text-sm text-[#7D141D]/80">Lagos, Nigeria</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}