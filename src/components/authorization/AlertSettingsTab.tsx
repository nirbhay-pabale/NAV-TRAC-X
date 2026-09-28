import React, { useState } from 'react';
import {
  Bell,
  ShieldAlert,
  Plus,
  Trash2,
  CheckCircle2,
  Sliders,
  Loader2
} from 'lucide-react';
import { useAlertRules, useUpdateAlertRules } from '../../hooks/useAuthorizationData';
import type { AlertRule } from '../../types/authorization';

export const AlertSettingsTab: React.FC = () => {
  const { data, isLoading } = useAlertRules();
  const rules: AlertRule[] = data || [];
  const updateMutation = useUpdateAlertRules();

  // New Rule Form State
  const [name, setName] = useState('');
  const [denialThreshold, setDenialThreshold] = useState<number>(3);
  const [groupingKey, setGroupingKey] = useState<
    'Same Document' | 'Same Unit' | 'Same Terminal/Device' | 'Same Officer PNo'
  >('Same Document');
  const [timeWindow, setTimeWindow] = useState<'15 Minutes' | '1 Hour' | '6 Hours' | '24 Hours'>('15 Minutes');
  const [action, setAction] = useState<
    'Notify Security Desk' | 'Quarantine Device Token' | 'Lockdown EMCON Sector' | 'Flag High-Priority Investigation'
  >('Flag High-Priority Investigation');

  const handleAddRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const newRule: AlertRule = {
      id: `RULE-0${rules.length + 1}`,
      name,
      denialThreshold,
      groupingKey,
      timeWindow,
      action,
      isActive: true,
    };

    try {
      await updateMutation.mutateAsync([...rules, newRule]);
      setName('');
      setDenialThreshold(3);
    } catch (err) {
      console.error('Failed to add rule:', err);
    }
  };

  const handleToggleRule = async (ruleId: string) => {
    const updated = rules.map((r) => (r.id === ruleId ? { ...r, isActive: !r.isActive } : r));
    try {
      await updateMutation.mutateAsync(updated);
    } catch (err) {
      console.error('Failed to toggle rule:', err);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    const updated = rules.filter((r) => r.id !== ruleId);
    try {
      await updateMutation.mutateAsync(updated);
    } catch (err) {
      console.error('Failed to delete rule:', err);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-white border border-[#E6EAF2] rounded-xl p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB]">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0F172A]">
              Cryptographic Threat & Anomaly Detection Rules
            </h3>
            <p className="text-xs text-[#64748B]">
              Automated anomaly response triggers evaluating real-time denial velocity and cluster patterns
            </p>
          </div>
        </div>

        <div className="text-xs font-mono text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1.5 font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Real-Time Engine Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Configurable Threshold Form */}
        <div className="lg:col-span-5">
          <div className="bg-white border border-[#E6EAF2] rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
              <Sliders className="w-4 h-4 text-blue-600" />
              <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                Configure New Threshold Rule
              </h4>
            </div>

            <form onSubmit={handleAddRule} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Rule Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rapid Attack Vector on Tactical Plans"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Threshold Definition: "Alert if more than [N] denied attempts occur for [Grouping] within [Time Window]" */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider font-mono block">
                  Rule Trigger Logic
                </span>

                <div className="flex items-center gap-2 flex-wrap text-slate-700 text-xs">
                  <span>Alert if more than</span>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={denialThreshold}
                    onChange={(e) => setDenialThreshold(parseInt(e.target.value) || 1)}
                    className="w-16 bg-white border border-slate-200 rounded-lg px-2 py-1 text-center font-bold text-[#0F172A] font-mono focus:outline-none focus:border-blue-500"
                  />
                  <span>denied attempts occur for</span>
                </div>

                <div>
                  <label className="block text-[10.5px] text-slate-500 mb-1">Grouping Scope:</label>
                  <select
                    value={groupingKey}
                    onChange={(e) =>
                      setGroupingKey(
                        e.target.value as 'Same Document' | 'Same Unit' | 'Same Terminal/Device' | 'Same Officer PNo'
                      )
                    }
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 font-mono focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Same Document">Same Document</option>
                    <option value="Same Unit">Same Unit</option>
                    <option value="Same Terminal/Device">Same Terminal / Hardware Device</option>
                    <option value="Same Officer PNo">Same Officer PNo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10.5px] text-slate-500 mb-1">Within Time Window:</label>
                  <select
                    value={timeWindow}
                    onChange={(e) =>
                      setTimeWindow(e.target.value as '15 Minutes' | '1 Hour' | '6 Hours' | '24 Hours')
                    }
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 font-mono focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="15 Minutes">15 Minutes</option>
                    <option value="1 Hour">1 Hour</option>
                    <option value="6 Hours">6 Hours</option>
                    <option value="24 Hours">24 Hours</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10.5px] text-slate-500 mb-1">Automated Action:</label>
                  <select
                    value={action}
                    onChange={(e) =>
                      setAction(
                        e.target.value as
                          | 'Notify Security Desk'
                          | 'Quarantine Device Token'
                          | 'Lockdown EMCON Sector'
                          | 'Flag High-Priority Investigation'
                      )
                    }
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 font-mono focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Flag High-Priority Investigation">Flag High-Priority Investigation</option>
                    <option value="Quarantine Device Token">Quarantine Device Token</option>
                    <option value="Lockdown EMCON Sector">Lockdown EMCON Sector</option>
                    <option value="Notify Security Desk">Notify Security Desk</option>
                  </select>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={updateMutation.isPending || !name}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Rule...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Deploy Alert Rule</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Active Rules List */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
              Active Security Detection Rules ({rules.length})
            </h4>
            <span className="text-[11px] font-mono text-slate-500">
              Evaluated on each access rejection
            </span>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-slate-500 text-xs font-mono animate-pulse">
              Loading detection rules...
            </div>
          ) : (
            <div className="space-y-3">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className={`bg-white border rounded-xl p-4 transition-all shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    rule.isActive ? 'border-[#E6EAF2]' : 'border-slate-200 opacity-60'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-600">{rule.id}</span>
                      <h5 className="text-sm font-bold text-[#0F172A]">{rule.name}</h5>
                      <span
                        className={`px-2 py-0.2 rounded text-[9.5px] font-mono font-bold ${
                          rule.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}
                      >
                        {rule.isActive ? 'ACTIVE' : 'MUTED'}
                      </span>
                    </div>

                    {/* Rule description formula */}
                    <div className="text-xs text-slate-600 font-mono flex items-center gap-1.5 flex-wrap">
                      <span>Threshold:</span>
                      <strong className="text-amber-700 font-bold">&gt; {rule.denialThreshold} attempts</strong>
                      <span>• Scope:</span>
                      <strong className="text-slate-900">{rule.groupingKey}</strong>
                      <span>• Window:</span>
                      <strong className="text-blue-600">{rule.timeWindow}</strong>
                    </div>

                    <div className="text-[11px] text-slate-500 font-sans flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                      <span>Trigger Action: <strong className="text-slate-800">{rule.action}</strong></span>
                    </div>
                  </div>

                  {/* Actions: Toggle & Delete */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleToggleRule(rule.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-colors cursor-pointer ${
                        rule.isActive
                          ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {rule.isActive ? 'Enabled' : 'Disabled'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteRule(rule.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Remove this rule"
                      aria-label={`Remove rule ${rule.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
