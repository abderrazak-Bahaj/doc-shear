'use client';
import { useSession } from 'next-auth/react';
import React from 'react';
import { Loader2 } from 'lucide-react';

const WarpLoader: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { status } = useSession();
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  return <>{children}</>;
};

export default WarpLoader;
