"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export function SessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Give a small delay to ensure session is loaded
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}
