import React, { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { Card, FormField, Input, Toast } from '../ui/primitives';

export const SettingsSection: React.FC = () => {
  const { user } = useAuthStore();
  const [name, setName] = useState(user?.name || 'Enterprise Operator');
  const [email, setEmail] = useState(user?.email || 'admin@microps.in');
  const [apiKey] = useState('mk_live_99482710384729103847');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setToastMessage('Account profile updated successfully.');
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setToastMessage('Production API Token copied to clipboard.');
  };

  return (
    <div className="max-w-4xl space-y-8 animate-fadeIn">
      {toastMessage && (
        <Toast message={toastMessage} type="info" onDismiss={() => setToastMessage(null)} />
      )}

      <div className="pb-4 border-b border-border-subtle">
        <h1 className="text-xl font-headline-md font-semibold text-ivory tracking-tight">
          Organization & Account Settings
        </h1>
        <p className="text-xs text-text-secondary font-mono mt-0.5">
          Manage operator identities, security tokens, and deployment vault policies.
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile Card */}
        <Card>
          <h3 className="font-headline-md text-base text-ivory font-semibold mb-1">Operator Identity</h3>
          <p className="text-xs text-text-secondary font-mono mb-6">Personal details and authenticated role</p>

          <form onSubmit={handleSaveProfile} className="space-y-4 max-w-lg">
            <FormField label="Full Name">
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </FormField>

            <FormField label="Email Address">
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled />
            </FormField>

            <FormField label="Assigned Role">
              <Input value="Root Administrator (Full DevOps Vault Access)" disabled />
            </FormField>

            <div className="pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 bg-gold hover:bg-gold-hover text-obsidian font-mono text-xs font-bold uppercase tracking-wider rounded-lg transition-all"
              >
                Save Profile
              </button>
            </div>
          </form>
        </Card>

        {/* API Tokens Card */}
        <Card>
          <h3 className="font-headline-md text-base text-ivory font-semibold mb-1">Production API Tokens</h3>
          <p className="text-xs text-text-secondary font-mono mb-6">Use bearer tokens for CLI or CI/CD runner integration</p>

          <div className="flex flex-col sm:flex-row gap-3 max-w-xl">
            <input
              type="password"
              value={apiKey}
              readOnly
              className="flex-1 bg-obsidian border border-border-subtle rounded-lg px-4 py-2.5 text-ivory font-mono text-sm select-all"
            />
            <button
              onClick={handleCopyKey}
              className="px-5 py-2.5 bg-surface-elevated border border-border-subtle hover:border-gold text-ivory font-mono text-xs rounded-lg transition-colors shrink-0"
            >
              Copy Token
            </button>
          </div>
        </Card>

        {/* Security / Audit Card */}
        <Card>
          <h3 className="font-headline-md text-base text-ivory font-semibold mb-1">Security & Audit Policy</h3>
          <p className="text-xs text-text-secondary font-mono mb-4">Strict enterprise compliance policies enabled</p>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between p-3 bg-surface-elevated rounded-lg border border-border-subtle">
              <div>
                <span className="text-ivory font-semibold block">Two-Factor Authentication (2FA)</span>
                <span className="text-[11px] text-text-muted">Enforced via hardware FIDO2 keys</span>
              </div>
              <span className="px-2.5 py-1 bg-success/10 text-success rounded font-bold">ENABLED</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-surface-elevated rounded-lg border border-border-subtle">
              <div>
                <span className="text-ivory font-semibold block">Immutable Audit Logging</span>
                <span className="text-[11px] text-text-muted">Retained for 365 days in cold storage</span>
              </div>
              <span className="px-2.5 py-1 bg-success/10 text-success rounded font-bold">ACTIVE</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
