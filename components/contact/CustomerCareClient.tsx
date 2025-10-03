"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function CustomerCareClient() {
  const search = useSearchParams();
  const template = search?.get("template") ?? "";
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);

  async function send(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const body = Object.fromEntries(new FormData(e.currentTarget));
    if (template) body.templateId = template;

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setLoading(false);
    if (res.ok) setOk(true);
  }

  return (
    <Card className="p-6 lg:p-8 rounded-2xl shadow-lg max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Contact</h1>
      <p className="mb-6 text-[#7D141D]/80">We’ll get back to you as soon as we see this.</p>

      {ok ? (
        <p className="text-green-700">✓ Sent. Talk soon.</p>
      ) : (
        <form onSubmit={send} className="space-y-4">
          <Input 
          name="name"
           placeholder="Your name" 
           required />
          <Input 
          name="email" 
          type="email" 
          placeholder="Email" 
          required />
          <Input 
          name="phone" 
          placeholder="Phone (optional)" />
          <Textarea 
          name="message" 
          placeholder="What do you need?" 
          rows={5} 
          required />
          <input 
          type="hidden" 
          name="templateId" 
          value={template} />

          <Button
            type="submit"
            className="rounded-full bg-[#7D141D] text-white"
            disabled={loading}
          >
            {loading && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
            Send
          </Button>
        </form>
      )}

      <Button
        asChild
        variant="outline"
        className="mt-3 w-full rounded-full border-green-500 text-slate-700 hover:bg-green-600"
      >
        <a href="https://wa.me/2349012065117">Chat on WhatsApp</a>
      </Button>
    </Card>
  );
}