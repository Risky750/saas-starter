"use client";
import { useState } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Mail } from "lucide-react";
import { Card } from "../../../components/ui/card";
import { useRouter } from "next/navigation";
import Image from "next/image";

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

    if (res.ok) setSent(true);
  }

  return (
<div className="relative min-h-screen">
  <Image
    src="/images/Group7(1).svg"
    alt="Background"
    fill
    priority
    className="object-cover object-center -z-10"
  />
    <main
      className="min-h-screen text-[#7D141D] px-4 py-16"
    >
      <div className="max-w-md mx-auto flex flex-col items-center justify-center">
        <Card className="p-6 lg:p-8 rounded-2xl shadow w-full bg-white space-y-6">
          {/* Heading */}
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-1">Request a Custom Design</h1>
            <p className="text-sm text-[#7D141D]/80">
              Tell us what you have in mind and we’ll get back to you quickly.
            </p>
          </div>

          {sent ? (
            <p className="text-green-700 font-medium text-center">
              ✅ Request sent! We'll contact you soon.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email input with icon */}
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#FF1E27]"
                />
                <Input
                  name="email"
                  type="email"
                  placeholder="Your email"
                  required
                  className="pl-10"
                />
              </div>

              {/* Details textarea */}
              <textarea
                name="details"
                placeholder="Describe your custom design needs..."
                required
                className="w-full rounded-lg border border-gray-300 p-3 min-h-[100px] text-sm"
              />

              {/* Submit button */}
              <Button
                type="submit"
                className="w-full rounded-full bg-[#7D141D] text-white hover:bg-[#FF1E27]"
              >
                Send Request
              </Button>
            </form>
          )}

          {/* WhatsApp contact */}
          <div className="pt-2">
            <Button
              onClick={() => router.push("https://wa.me/2349012065117")}
              variant="outline"
              className="w-full flex items-center justify-center gap-2 border-green-400 text-green-700 rounded-full hover:bg-green-50"
            >
               Contact us on WhatsApp
            </Button>
          </div>
        </Card>
      </div>
    </main>
    </div>
  )
}
