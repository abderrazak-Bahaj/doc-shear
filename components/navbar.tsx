'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import { UserNav } from '@/components/user-nav';
import { FileText } from 'lucide-react';

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container flex h-16 items-center px-4">
        <Link
          href={status === 'authenticated' ? '/documents' : '/'}
          className="flex items-center gap-2 mr-6"
        >
          <FileText className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold">DocShare</span>
        </Link>
        <div className="flex-1 flex items-center gap-6 text-sm" />

        <div className="flex items-center gap-2">
          <ModeToggle />
          {status === 'authenticated' ? (
            <UserNav />
          ) : (
            <Button asChild>
              <Link href="/auth/signin">Sign In</Link>
            </Button>
          )}
        </div>
      </nav>
    </header>
  );
}
