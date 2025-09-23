"use client";
import { useState } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Mail } from "lucide-react";
import { Card } from "../../../components/ui/card";
import { useRouter } from "next/navigation";

export default function CustomDesignPage() {
  const [sent, setSent] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const res = await fetch("/api/custom", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData)),
    });

    if (res.ok) {
      setSent(true);
    }
  }

  return (
    <main className="min-h-screen bg-[#F4EFEA] text-[#7D141D] px-4 py-16">
      <div className="max-w-md mx-auto flex flex-col items-center justify-center">
        <Card className="p-6 lg:p-8 rounded-2xl shadow w-full bg-white">
          <h1 className="text-3xl font-bold mb-2">Custom Design Help</h1>
          <p className="mb-6 text-sm text-[#7D141D]/80">
            Need a website or graphic tailored to your brand? Fill out the form below and our team will reach out to help you with your custom design needs.
          </p>

          {sent ? (
            <p className="text-green-700 font-medium">
              Request sent! We'll contact you soon.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block">
                <Mail size={18} className="text-[#FF1E27]" />
                <Input
                  name="email"
                  type="email"
                  placeholder="Your email"
                  required
                />
              </label>
              <label className="block">
                <textarea
                  name="details"
                  placeholder="Describe your custom design needs..."
                  required
                  className="w-full rounded-lg border border-gray-300 p-2 mt-2 min-h-[80px]"
                />
              </label>
              <Button
                type="submit"
                className="w-full rounded-full bg-[#7D141D] text-white hover:bg-[#FF1E27]"
              >
                Request Help
              </Button>
            </form>
          )}
          <div className="w-full flex justify-center">
            <Button
              onClick={() => router.push("https://wa.me/2349012065117")}
              variant="outline"
              className="mt-1 flex flex-col items-center border-green-400 justify-center rounded-full hover:bg-green-50">
              Contact us on WhatsApp
            </Button>
          </div>
        </Card>
  
      </div>
    </main>
  );
}
