'use client';
import { useSession } from 'next-auth/react';
import { redirect, RedirectType } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  if (status === 'authenticated')
  {
    redirect("/documents",RedirectType.replace)
  }
  return <>{children}</>
}
