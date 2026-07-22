'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function AccountPage() {
  const { user, isAuthenticated, login, logout, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 lg:px-8">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 font-display text-2xl text-accent">
            {user.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <h1 className="font-display text-3xl uppercase tracking-wider text-text">
            {user.name}
          </h1>
          <p className="text-sm text-text-muted">{user.email}</p>
        </div>

        <div className="card space-y-4">
          <h2 className="font-display text-lg uppercase tracking-wider text-text">
            Account Details
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-text-muted">Name</span>
              <p className="font-medium text-text">{user.name}</p>
            </div>
            <div>
              <span className="text-text-muted">Email</span>
              <p className="font-medium text-text">{user.email}</p>
            </div>
            <div>
              <span className="text-text-muted">User ID</span>
              <p className="font-medium text-text">#{user.id}</p>
            </div>
            <div>
              <span className="text-text-muted">Role</span>
              <p className="font-medium text-text">Admin</p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Button variant="danger" className="w-full" onClick={() => logout()}>
            Sign Out
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16 lg:px-8">
      <div className="text-center mb-8">
        <h1 className="font-display text-3xl uppercase tracking-wider text-text">
          Account
        </h1>
        <p className="mt-2 text-sm text-text-muted">
          Sign in to manage your orders and profile.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && (
          <p className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          Sign In
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-xs text-text-muted">
          For admin access, use the{' '}
          <a href="/login" className="text-accent hover:text-accent-hover">
            admin login
          </a>.
        </p>
      </div>
    </div>
  );
}
