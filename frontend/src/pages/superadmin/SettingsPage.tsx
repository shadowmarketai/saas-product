import { useState } from 'react';
import { motion } from 'framer-motion';
import { GradientButton } from '@/components/ui/GradientButton';

interface PlatformSettings {
  platformName: string;
  supportEmail: string;
  defaultCurrency: 'INR' | 'USD' | 'EUR';
}

interface CommissionSettings {
  defaultCommissionPct: number;
  autoPayoutThreshold: number;
}

interface NotificationSettings {
  emailNotifications: boolean;
  smsAlerts: boolean;
  whatsappNotifications: boolean;
}

interface SecuritySettings {
  minPasswordLength: number;
  sessionTimeout: '30min' | '1hr' | '8hr' | '24hr';
}

function SectionHeader({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-heading flex items-center gap-2">
        <span>{icon}</span> {title}
      </h2>
      <p className="text-sm text-muted mt-0.5">{desc}</p>
    </div>
  );
}

interface ToggleProps {
  label: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}

function Toggle({ label, desc, checked, onChange }: ToggleProps) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-theme last:border-0">
      <div>
        <p className="text-sm font-medium text-heading">{label}</p>
        <p className="text-xs text-muted mt-0.5">{desc}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-indigo-500' : 'bg-gray-200'}`}
      >
        <motion.span
          layout
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className={`inline-block h-4 w-4 rounded-full bg-white shadow ${checked ? 'translate-x-6' : 'translate-x-1'}`}
        />
      </button>
    </div>
  );
}

export function SettingsPage() {
  const [platform, setPlatform] = useState<PlatformSettings>({
    platformName: 'NexaStack',
    supportEmail: 'support@nexastack.io',
    defaultCurrency: 'INR',
  });

  const [commission, setCommission] = useState<CommissionSettings>({
    defaultCommissionPct: 25,
    autoPayoutThreshold: 5000,
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    smsAlerts: false,
    whatsappNotifications: false,
  });

  const [security, setSecurity] = useState<SecuritySettings>({
    minPasswordLength: 8,
    sessionTimeout: '1hr',
  });

  const handleSave = () => {
    window.alert('Settings saved!');
  };

  return (
    <div className="max-w-2xl">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-3xl font-bold font-heading text-heading">Platform Settings</h1>
        <p className="text-muted mt-1">Configure platform-wide defaults and preferences</p>
      </motion.div>

      {/* Platform Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mt-8 bg-card rounded-2xl p-6 shadow-md border border-theme"
      >
        <SectionHeader icon="🌐" title="Platform Settings" desc="Core identity and communication settings" />
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-heading mb-1.5">Platform Name</label>
            <input
              type="text"
              value={platform.platformName}
              onChange={(e) => setPlatform({ ...platform, platformName: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-heading text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-heading mb-1.5">Support Email</label>
            <input
              type="email"
              value={platform.supportEmail}
              onChange={(e) => setPlatform({ ...platform, supportEmail: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-heading text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-heading mb-1.5">Default Currency</label>
            <select
              value={platform.defaultCurrency}
              onChange={(e) => setPlatform({ ...platform, defaultCurrency: e.target.value as PlatformSettings['defaultCurrency'] })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-heading text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="INR">INR — Indian Rupee (₹)</option>
              <option value="USD">USD — US Dollar ($)</option>
              <option value="EUR">EUR — Euro (€)</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Commission Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-6 bg-card rounded-2xl p-6 shadow-md border border-theme"
      >
        <SectionHeader icon="💸" title="Commission Settings" desc="Default rates and payout thresholds" />
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-heading mb-1.5">
              Default Commission % <span className="text-muted font-normal">(20–40%)</span>
            </label>
            <input
              type="number"
              min={20}
              max={40}
              value={commission.defaultCommissionPct}
              onChange={(e) => setCommission({ ...commission, defaultCommissionPct: Number(e.target.value) })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-heading text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-heading mb-1.5">
              Auto-payout Threshold (₹)
            </label>
            <input
              type="number"
              min={0}
              value={commission.autoPayoutThreshold}
              onChange={(e) => setCommission({ ...commission, autoPayoutThreshold: Number(e.target.value) })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-heading text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
        </div>
      </motion.div>

      {/* Notification Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mt-6 bg-card rounded-2xl p-6 shadow-md border border-theme"
      >
        <SectionHeader icon="🔔" title="Notification Settings" desc="Control how alerts are delivered" />
        <Toggle
          label="Email Notifications"
          desc="Receive important updates via email"
          checked={notifications.emailNotifications}
          onChange={(v) => setNotifications({ ...notifications, emailNotifications: v })}
        />
        <Toggle
          label="SMS Alerts"
          desc="Get critical alerts via SMS"
          checked={notifications.smsAlerts}
          onChange={(v) => setNotifications({ ...notifications, smsAlerts: v })}
        />
        <Toggle
          label="WhatsApp Notifications"
          desc="Receive updates on WhatsApp"
          checked={notifications.whatsappNotifications}
          onChange={(v) => setNotifications({ ...notifications, whatsappNotifications: v })}
        />
      </motion.div>

      {/* Security Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6 bg-card rounded-2xl p-6 shadow-md border border-theme"
      >
        <SectionHeader icon="🔒" title="Security" desc="Authentication and session configuration" />
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-heading mb-1.5">Minimum Password Length</label>
            <input
              type="number"
              min={6}
              max={32}
              value={security.minPasswordLength}
              onChange={(e) => setSecurity({ ...security, minPasswordLength: Number(e.target.value) })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-heading text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-heading mb-1.5">Session Timeout</label>
            <select
              value={security.sessionTimeout}
              onChange={(e) => setSecurity({ ...security, sessionTimeout: e.target.value as SecuritySettings['sessionTimeout'] })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-heading text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="30min">30 minutes</option>
              <option value="1hr">1 hour</option>
              <option value="8hr">8 hours</option>
              <option value="24hr">24 hours</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Save */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="mt-6 flex justify-end"
      >
        <GradientButton onClick={handleSave}>Save Settings</GradientButton>
      </motion.div>
    </div>
  );
}
