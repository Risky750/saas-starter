'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useFormStatus } from 'react-dom';


export function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      variant="outline"
      className="w-full rounded-full text-[#7D141D] border-[#7D141D] hover:bg-[#F4EFEA] hover:text-[#FF1E27] focus:ring-4 focus:ring-[#FF1E27]/30 transition disabled:opacity-60"
    >
      {pending ? (
        <>
          <Loader2 className="animate-spin mr-2 h-4 w-4 text-[#FF1E27]" />
          Loading...
        </>
      ) : (
        <>
          Get Started
          <ArrowRight className="ml-2 h-4 w-4" />
        </>
      )}
    </Button>
  );
}