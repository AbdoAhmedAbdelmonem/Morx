'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { API_BASE_URL, API_ENDPOINTS, getAuthHeaders } from '@/lib/api-config';

export default function CompleteProfile() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check if user is logged in and needs password setup
    const token = localStorage.getItem('auth_token');
    const session = localStorage.getItem('student_session');
    
    if (!token || !session) {
      // User is not logged in, redirect to signin
      router.push('/signin');
      return;
    }

    const userData = JSON.parse(session);
    setUser(userData);

    // If user doesn't need password setup, redirect to home
    if (!userData.needsPasswordSetup) {
      router.push('/');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.USERS.SET_PASSWORD(user.user_id)}`,
        {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({ password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to set password');
        setLoading(false);
        return;
      }

      // Update session to remove needsPasswordSetup flag
      const updatedUser = { ...user, needsPasswordSetup: false };
      localStorage.setItem('student_session', JSON.stringify(updatedUser));

      // Redirect to home
      router.push('/');
    } catch (error) {
      console.error('Error setting password:', error);
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex justify-center py-8">
            <p>Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <Link href="/" className="mb-2">
            <Image src="/Morx.png" alt="Morx" width={60} height={60} className="size-15" />
          </Link>
          <CardTitle className="text-2xl font-bold text-center rock-salt">
            Complete Your Profile
          </CardTitle>
          <CardDescription className="text-center">
            Welcome {user.first_name}! Please set a password for your account.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
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
                value={user.email}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password (min 8 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                minLength={8}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Saving...' : 'Set Password & Continue'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
