import React from 'react';
import {
  Shield,
  Database,
  Link,
  ShieldCheck,
  Fingerprint,
  UserCheck,
  Radio,
  Loader2
} from 'lucide-react';
import { useSystemStatus } from '../../hooks/useSystemStatus';

export const SystemStatusPanel: React.FC = () => {
  const { data: statusData, isLoading, isError } = useSystemStatus();

  const getServiceIcon = (iconName: string) => {
    switch (iconName) {
      case 'database':
        return <Database className="w-4 h-4 text-slate-300" />;
      case 'chain':
        return <Link className="w-4 h-4 text-slate-300" />;
      case 'signature':
        return <ShieldCheck className="w-4 h-4 text-slate-300" />;
      case 'fingerprint':
        return <Fingerprint className="w-4 h-4 text-slate-300" />;
      case 'auth':
        return <UserCheck className="w-4 h-4 text-slate-300" />;
      case 'emcon':
        return <Radio className="w-4 h-4 text-slate-300" />;
      default:
        return <Shield className="w-4 h-4 text-slate-300" />;
    }
  };

  const getStatusIndicator = (status: string, statusType: string) => {
    switch (statusType) {
      case 'green':
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
            {status}
          </span>
        );
      case 'amber':
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
            {status}
          </span>
        );
      case 'red':
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-red-400">
            <span className="w-2 h-2 rounded-full bg-red-400 shadow-[0_0_6px_rgba(239,68,68,0.8)]" />
            {status}
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div className="navtrac-dashboard-card p-5 flex flex-col justify-between h-full">
      <div>
        {/* Header with Overall Status Pill */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-700/50">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold tracking-wider text-white uppercase font-['Montserrat']">
                SYSTEM STATUS
              </h3>
            </div>
          </div>

          {/* Dynamic Overall Pill */}
          {statusData && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-[10.5px] font-semibold text-emerald-400 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {statusData.overallStatus}
            </span>
          )}
        </div>

        {/* Loading / Error States */}
        {isLoading && (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
            <span className="text-xs">Checking system diagnostics…</span>
          </div>
        )}

        {isError && (
          <div className="py-8 text-center text-xs text-red-400">
            Unable to query node telemetry.
          </div>
        )}

        {/* Service Rows List */}
        {!isLoading && !isError && statusData && (
          <div className="mt-3 space-y-2.5">
            {statusData.services.map((service) => (
              <div
                key={service.id}
                className="flex items-center justify-between py-1 text-xs hover:bg-slate-800/30 px-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-md bg-slate-800/70 flex items-center justify-center text-slate-400">
                    {getServiceIcon(service.icon)}
                  </div>
                  <span className="text-slate-300 font-medium text-[11.5px]">
                    {service.name}
                  </span>
                </div>
                <div>
                  {getStatusIndicator(service.status, service.statusType)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
