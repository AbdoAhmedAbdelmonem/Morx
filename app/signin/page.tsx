"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CredentialResponse } from '@react-oauth/google'
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { AuthTransition } from "@/components/auth-transition"
import { GoogleSignInButton } from "@/components/google-signin-button"
import { API_BASE_URL, API_ENDPOINTS } from "@/lib/api-config"

export default function SignInPage() {
  const router = useRouter()
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle successful Google login
  const handleGoogleSuccess = async (credentialResponse: any) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.GOOGLE}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Google sign-in failed');
        setLoading(false);
        return;
      }

      // Successful login - store JWT token and user data
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
      }
      const userData = {
        user_id: data.user.id,
        email: data.user.email,
        first_name: data.user.first_name,
        last_name: data.user.last_name,
        picture: data.user.picture,
        needsPasswordSetup: data.needsPasswordSetup,
        ...data.user
      };
      localStorage.setItem('student_session', JSON.stringify(userData));
      window.dispatchEvent(new CustomEvent('userLogin', { detail: userData }));
      
      // Redirect to complete-profile if user needs to set password
      if (data.needsPasswordSetup) {
        router.push('/complete-profile');
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      setError('An error occurred during Google sign-in. Please try again.');
      setLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Invalid email or password');
        setLoading(false);
        return;
      }

      // Successful login - store JWT token and user data
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
      }
      const userData = {
        user_id: data.user.id,
        email: data.user.email,
        first_name: data.user.first_name,
        ...data.user
      };
      localStorage.setItem('student_session', JSON.stringify(userData));
      window.dispatchEvent(new CustomEvent('userLogin', { detail: userData }));
      router.push('/');
    } catch (error) {
      console.error('Sign-in error:', error);
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <AuthTransition mode="signin">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 flex flex-col items-center">
            <Link href="/" className="mb-2">
              <Image src={mounted && theme === "dark" ? "/Morx.png" : "/Morx-dark.png"} alt="Morx" width={60} height={60} className="size-15" />
            </Link>
            <CardTitle className="text-2xl font-bold text-center rock-salt">
              Welcome to Morx
            </CardTitle>
            <CardDescription className="text-center">
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <GoogleSignInButton onSuccess={handleGoogleSuccess} loading={loading} />
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with email
                </span>
              </div>
            </div>

            <form onSubmit={handleEmailSignIn} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-xs text-muted-foreground text-center">
              By continuing, you agree to our{" "}
              <Link href="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </div>
          </CardFooter>
        </Card>
      </AuthTransition>
    </div>
  )
}
