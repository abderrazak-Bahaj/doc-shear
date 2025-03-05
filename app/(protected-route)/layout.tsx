'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { Loader2 } from 'lucide-react';
import { redirect } from 'next/navigation';

export default function AuthLayout({ children }: { children: React.ReactNode }): React.ReactNode {
  const { status } = useSession();
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  if (status === 'authenticated') {
    return <>{children}</>;
  }
  return redirect('/auth/signin');
}
