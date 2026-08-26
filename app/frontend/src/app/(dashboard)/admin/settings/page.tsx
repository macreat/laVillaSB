'use client';

import { useEffect, useState } from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { Settings, Save } from 'lucide-react';
import { api } from '@/lib/api';

type ServiceHealth = { name: string; url: string; status: string };

const ADMIN_SERVICES: ReadonlyArray<{ name: string; url: string }> = [
  { name: 'Catalog Service', url: 'catalog' },
  { name: 'Inventory Service', url: 'inventory' },
  { name: 'Orders Service', url: 'cart' },
];

function toInitialServiceHealth(): ServiceHealth[] {
  return ADMIN_SERVICES.map((svc) => ({ ...svc, status: 'Unknown' }));
}

export default function SettingsPage() {
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [services, setServices] = useState<ServiceHealth[]>(toInitialServiceHealth);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    const markStatus = (url: string, status: string) => {
      setServices((prev) => prev.map((s) => (s.url === url ? { ...s, status } : s)));
    };
    ADMIN_SERVICES.forEach((svc) => {
      api
        .proxyGet<{ status: string }>(svc.url, 'health')
        .then((res) => {
          if (!cancelled) markStatus(svc.url, res.status);
        })
        .catch(() => {
          if (!cancelled) markStatus(svc.url, 'Unreachable');
        });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      await api.request('PUT', '/api/admin/me', {
        name,
        email,
        current_password: currentPassword || undefined,
        new_password: newPassword || undefined,
        new_password_confirmation: confirmPassword || undefined,
      });
      setMessage({ type: 'success', text: 'Settings saved' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e) {
      setMessage({ type: 'error', text: e instanceof Error ? e.message : 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <TopBar title="Settings" />

      <div className="p-6 space-y-6">
        <form onSubmit={handleSave}>
          <Card>
            <h3 className="mb-4 font-display text-lg tracking-wide text-text">Profile</h3>
            <div className="space-y-4">
              <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
              <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <h3 className="mb-4 mt-8 font-display text-lg tracking-wide text-text">Change Password</h3>
            <div className="space-y-4">
              <Input
                label="Current Password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <Input
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <Input
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            {message && (
              <p className={`mt-4 text-sm ${message.type === 'success' ? 'text-accent' : 'text-danger'}`}>
                {message.text}
              </p>
            )}

            <div className="mt-6 flex justify-end">
              <Button type="submit" isLoading={saving}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </Card>
        </form>

        <Card>
          <h3 className="mb-4 font-display text-lg tracking-wide text-text">Microservice Status</h3>
          <div className="space-y-2">
            {services.map((svc) => (
              <div key={svc.name} className="flex items-center justify-between rounded-md bg-surface-elevated px-4 py-3">
                <span className="text-sm font-medium text-text">{svc.name}</span>
                <span className={`text-xs font-medium ${
                  svc.status === 'ok' ? 'text-accent' :
                  svc.status === 'Unreachable' ? 'text-danger' :
                  'text-text-muted'
                }`}>
                  {svc.status === 'ok' ? 'Healthy' : svc.status}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
