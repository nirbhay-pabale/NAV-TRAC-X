import React, { useState } from 'react';
import {
  Shield,
  ShieldAlert,
  Sliders,
  Clock,
  Mail
} from 'lucide-react';
import { AuthorizationHeader } from '../components/authorization/AuthorizationHeader';
import { PoliciesTab } from '../components/authorization/PoliciesTab';
import { PendingRequestsTab } from '../components/authorization/PendingRequestsTab';
import { AccessDeniedLogTab } from '../components/authorization/AccessDeniedLogTab';
import { AlertSettingsTab } from '../components/authorization/AlertSettingsTab';
import { GmailIntegrationTab } from '../components/authorization/GmailIntegrationTab';
import { NewPolicyModal } from '../components/authorization/NewPolicyModal';
import { usePendingRequests, useAccessDeniedLog } from '../hooks/useAuthorizationData';
import { useGmailIntegration } from '../hooks/useNavtracApi';

export const AuthorizationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'policies' | 'requests' | 'denied-log' | 'alerts' | 'gmail'>('policies');
  const [isNewPolicyModalOpen, setIsNewPolicyModalOpen] = useState(false);

  const { data: requests = [] } = usePendingRequests();
  const { data: deniedLogs = [] } = useAccessDeniedLog();
  const { status } = useGmailIntegration();

  const pendingCount = requests.filter((r) => r.status === 'Pending').length;
  const alertFiredCount = deniedLogs.filter((l) => l.alertFired).length;
  const isGmailConnected = status.data?.connected;

  return (
    <div className="space-y-5 animate-fadeIn pb-12 max-w-[1700px] mx-auto">
      {/* Page Header */}
      <AuthorizationHeader onNewPolicyClick={() => setIsNewPolicyModalOpen(true)} />

      {/* Top-Level Page Tab Bar */}
      <div className="rounded-xl bg-white border border-slate-200 p-1.5 shadow-sm flex items-center gap-1.5 overflow-x-auto">
        {/* Tab 1: Policies */}
        <button
          type="button"
          onClick={() => setActiveTab('policies')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold text-xs transition-all flex-shrink-0 cursor-pointer ${
            activeTab === 'policies'
              ? 'bg-[#2563EB] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Policies</span>
        </button>

        {/* Tab 2: Pending Requests */}
        <button
          type="button"
          onClick={() => setActiveTab('requests')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold text-xs transition-all flex-shrink-0 cursor-pointer ${
            activeTab === 'requests'
              ? 'bg-[#2563EB] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Pending Requests</span>
          {pendingCount > 0 && (
            <span
              className={`px-2 py-0.2 rounded-full text-[10.5px] font-bold ${
                activeTab === 'requests'
                  ? 'bg-white text-blue-700'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              {pendingCount}
            </span>
          )}
        </button>

        {/* Tab 3: Access Denied Log */}
        <button
          type="button"
          onClick={() => setActiveTab('denied-log')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold text-xs transition-all flex-shrink-0 cursor-pointer ${
            activeTab === 'denied-log'
              ? 'bg-[#2563EB] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Access Denied Log</span>
          {alertFiredCount > 0 && (
            <span
              className={`px-2 py-0.2 rounded-full text-[10.5px] font-bold ${
                activeTab === 'denied-log'
                  ? 'bg-white text-red-700'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {alertFiredCount}
            </span>
          )}
        </button>

        {/* Tab 4: Alert Settings */}
        <button
          type="button"
          onClick={() => setActiveTab('alerts')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold text-xs transition-all flex-shrink-0 cursor-pointer ${
            activeTab === 'alerts'
              ? 'bg-[#2563EB] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Alert Rules</span>
        </button>

        {/* Tab 5: Gmail & Secure Notifications Integration */}
        <button
          type="button"
          onClick={() => setActiveTab('gmail')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold text-xs transition-all flex-shrink-0 cursor-pointer ${
            activeTab === 'gmail'
              ? 'bg-[#2563EB] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Gmail & Notifications</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
              isGmailConnected
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-slate-200 text-slate-700'
            }`}
          >
            {isGmailConnected ? 'LIVE' : 'STANDBY'}
          </span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="mt-2">
        {activeTab === 'policies' && <PoliciesTab onNewPolicyClick={() => setIsNewPolicyModalOpen(true)} />}
        {activeTab === 'requests' && <PendingRequestsTab />}
        {activeTab === 'denied-log' && <AccessDeniedLogTab />}
        {activeTab === 'alerts' && <AlertSettingsTab />}
        {activeTab === 'gmail' && <GmailIntegrationTab />}
      </div>

      {/* New Policy Modal */}
      <NewPolicyModal
        isOpen={isNewPolicyModalOpen}
        onClose={() => setIsNewPolicyModalOpen(false)}
      />
    </div>
  );
};

export default AuthorizationPage;
