"use client"

import { GoogleLogin } from '@react-oauth/google'
import { useTheme } from 'next-themes'
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useEffect, useState } from 'react'

interface GoogleSignInButtonProps {
  onSuccess: (response: any) => void;
  loading?: boolean;
}

export function GoogleSignInButton({ onSuccess, loading }: GoogleSignInButtonProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (loading) {
    return (
      <Button
        type="button"
        variant="outline"
        className="w-full h-11 gap-3 font-medium text-sm"
        disabled
      >
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Signing in...</span>
      </Button>
    );
  }

  // Show a placeholder while mounting to avoid hydration issues
  if (!mounted) {
    return (
      <Button
        type="button"
        variant="outline"
        className="w-full h-11 gap-3 font-medium text-sm"
        disabled
      >
        <span>Continue with Google</span>
      </Button>
    );
  }

  return (
    <div className="w-full flex justify-center">
      <GoogleLogin
        onSuccess={(credentialResponse) => {
          // This returns an ID token (credential) that can be verified by the backend
          onSuccess(credentialResponse);
        }}
        onError={() => {
          console.error('Google Login Failed');
        }}
        theme={resolvedTheme === 'dark' ? 'filled_black' : 'outline'}
        size="large"
        width="400"
        text="continue_with"
      />
    </div>
  )
}
