"use client";

import { SessionProvider } from "next-auth/react";
import { EdgeStoreProvider } from "@/lib/edgestore";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <EdgeStoreProvider>
        <TooltipProvider>
          {children}
          <Toaster />
        </TooltipProvider>
      </EdgeStoreProvider>
    </SessionProvider>
  );
}
