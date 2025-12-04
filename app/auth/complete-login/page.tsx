'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function CompleteLoginPage() {
  const router = useRouter();

  // OAuth login completion is not supported with Express.js backend
  // Redirect to signin page
  useEffect(() => {
    router.replace('/signin?error=oauth_not_supported');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground">Redirecting to sign in...</p>
      </div>
    </div>
  );
}
