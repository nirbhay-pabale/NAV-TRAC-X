import React, { useState } from 'react';
import {
  Mail,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Send,
  LogOut,
  ShieldAlert,
  Clock,
  ExternalLink,
  Layers,
  Inbox,
  Filter
} from 'lucide-react';
import { useGmailIntegration } from '../../hooks/useNavtracApi';

export const GmailIntegrationTab: React.FC = () => {
  const { status, notifications, sendTestEmail, disconnectGoogle, flushQueue } = useGmailIntegration();

  const [testEmailRecipient, setTestEmailRecipient] = useState('fleet-duty-officer@navy.mil.in');
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [filterType, setFilterType] = useState<string>('ALL');

  const data = status.data;
  const isConnected = data?.connected ?? false;
  const isEmcon = data?.emconActive ?? false;
  const queuedCount = data?.queuedNotificationsCount ?? 0;

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestResult(null);
    try {
      const res: any = await sendTestEmail.mutateAsync(testEmailRecipient);
      if (res.status === 'QUEUED') {
        setTestResult({
          success: true,
          message: `Notification queued for delivery (EMCON posture active). MsgID: ${res.messageId || 'PENDING'}`,
        });
      } else {
        setTestResult({
          success: true,
          message: `Verification message dispatched via ${res.provider || 'Gmail API'}. Message ID: ${res.messageId}`,
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err?.response?.data?.error || err.message || 'Failed to dispatch email.',
      });
    }
  };

  const handleConnect = async () => {
    try {
      // Direct user to Google OAuth start
      window.open('/api/integrations/google/start', '_blank', 'width=600,height=700');
    } catch (err) {
      console.error('Failed to initiate Google OAuth:', err);
    }
  };

  const filteredNotifications = (notifications.data || []).filter((item: any) => {
    if (filterType === 'ALL') return true;
    return item.type === filterType || item.status === filterType;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner: Connection & Operational Status */}
      <div className="bg-white border border-[#E6EAF2] rounded-xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
              isConnected
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                : 'bg-amber-50 text-amber-600 border border-amber-200'
            }`}>
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-base font-bold text-[#0F172A]">Google Workspace & Gmail API Service</h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono tracking-wider ${
                  isConnected
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {isConnected ? 'CONNECTED' : 'STANDBY / SIMULATED'}
                </span>
                {isEmcon && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono bg-purple-50 text-purple-700 border border-purple-200">
                    EMCON ACTIVE — QUEUED
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Dispatches end-to-end encrypted military security bulletins, leak containment alerts, and cryptographic authorization credentials.
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                status.refetch();
                notifications.refetch();
              }}
              disabled={status.isFetching}
              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${status.isFetching ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            {isConnected ? (
              <button
                type="button"
                onClick={() => disconnectGoogle.mutate()}
                disabled={disconnectGoogle.isPending}
                className="px-3.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Disconnect</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleConnect}
                className="px-4 py-1.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Connect Google OAuth 2.0</span>
              </button>
            )}
          </div>
        </div>

        {/* Integration Specs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-100 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-[10px] text-slate-500 uppercase font-mono font-bold block">Authorized Account</span>
            <span className="font-semibold text-slate-900 truncate block mt-0.5" title={data?.account || 'None'}>
              {data?.account || 'cyberwarfare-ops@navy.mil.in'}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-[10px] text-slate-500 uppercase font-mono font-bold block">Granted Scopes</span>
            <span className="font-mono text-[11px] text-blue-700 truncate block mt-0.5" title={data?.scopes?.join(', ') || 'gmail.send, gmail.readonly'}>
              {data?.scopes?.length ? `${data.scopes.length} Scopes Active` : 'gmail.send, gmail.readonly'}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-[10px] text-slate-500 uppercase font-mono font-bold block">Last Synchronized</span>
            <span className="font-mono text-slate-700 block mt-0.5">
              {data?.lastSuccessfulRequest ? new Date(data.lastSuccessfulRequest).toLocaleTimeString() : 'Active Standby'}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-[10px] text-slate-500 uppercase font-mono font-bold block">EMCON Offline Queue</span>
            <div className="flex items-center justify-between mt-0.5">
              <span className={`font-mono font-bold ${queuedCount > 0 ? 'text-purple-700' : 'text-slate-700'}`}>
                {queuedCount} Notifications Pending
              </span>
              {queuedCount > 0 && !isEmcon && (
                <button
                  type="button"
                  onClick={() => flushQueue.mutate()}
                  disabled={flushQueue.isPending}
                  className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 hover:bg-purple-200 text-purple-800 transition-colors"
                >
                  Flush
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dispatch Test Notification Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white border border-[#E6EAF2] rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Send className="w-4 h-4 text-blue-600" />
            <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
              Dispatch Verification Test
            </h4>
          </div>
          <p className="text-[11.5px] text-slate-500 leading-relaxed">
            Verify real-time delivery via Google API. If EMCON mode is active, the dispatch will safely queue into the local resilient air-gap buffer.
          </p>

          <form onSubmit={handleSendTest} className="space-y-3">
            <div>
              <label htmlFor="test-recipient-input" className="block text-[11px] font-semibold text-slate-700 mb-1">
                Recipient Email
              </label>
              <input
                id="test-recipient-input"
                type="email"
                required
                value={testEmailRecipient}
                onChange={(e) => setTestEmailRecipient(e.target.value)}
                placeholder="officer@navy.mil.in"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={sendTestEmail.isPending}
              className="w-full py-2 px-4 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <Send className={`w-3.5 h-3.5 ${sendTestEmail.isPending ? 'animate-pulse' : ''}`} />
              <span>{sendTestEmail.isPending ? 'Dispatching...' : 'Send Live Test Email'}</span>
            </button>
          </form>

          {testResult && (
            <div className={`p-3 rounded-lg border text-xs leading-relaxed ${
              testResult.success
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800'
                : 'bg-red-50/70 border-red-200 text-red-800'
            }`}>
              <div className="flex items-start gap-2">
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <span>{testResult.message}</span>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Security Triggers Reference */}
        <div className="lg:col-span-2 bg-white border border-[#E6EAF2] rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-600" />
            <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
              Automated Event Triggers & Notification Rules
            </h4>
          </div>
          <p className="text-[11.5px] text-slate-500">
            NAV-TRAC X dynamically dispatches standardized cryptographic security bulletins to authorized personnel upon tactical system events:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1 text-xs">
            <div className="p-3 bg-red-50/50 border border-red-100 rounded-lg space-y-1">
              <span className="font-bold text-red-900 block flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-600"></span>
                Document Leak Detected
              </span>
              <p className="text-[11px] text-red-700">
                Dispatches urgent bulletin with forensic convergence score, candidate recipient, and case ID.
              </p>
            </div>

            <div className="p-3 bg-red-50/50 border border-red-100 rounded-lg space-y-1">
              <span className="font-bold text-red-900 block flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-600"></span>
                Ledger Tampering Alert
              </span>
              <p className="text-[11px] text-red-700">
                Signals critical hash discrepancy, affected block index, and cryptographic mismatch details.
              </p>
            </div>

            <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-lg space-y-1">
              <span className="font-bold text-blue-900 block flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                Access Request Created
              </span>
              <p className="text-[11px] text-blue-700">
                Notifies commanding officers and clearance authorities of pending classified document requests.
              </p>
            </div>

            <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-lg space-y-1">
              <span className="font-bold text-amber-900 block flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                Clearance Revocation
              </span>
              <p className="text-[11px] text-amber-700">
                Instantly notifies revoked recipients and network nodes to invalidate local private session keys.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Event Notification Log */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider">
              Dispatched Notification Log ({filteredNotifications.length})
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
            >
              <option value="ALL">All Events</option>
              <option value="SECURITY_ALERT">Security Alert</option>
              <option value="LEDGER_INTEGRITY">Ledger Integrity</option>
              <option value="AUTHORIZATION_REQUEST">Authorization Request</option>
              <option value="RECIPIENT_REVOCATION">Recipient Revocation</option>
              <option value="TEST_NOTIFICATION">Test Notification</option>
              <option value="SENT">Status: Sent</option>
              <option value="QUEUED">Status: Queued</option>
            </select>
          </div>
        </div>

        <div className="bg-white border border-[#E6EAF2] rounded-xl overflow-hidden shadow-sm">
          {notifications.isLoading ? (
            <div className="p-8 text-center text-slate-400 text-xs font-mono animate-pulse">
              Loading notification records...
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <Inbox className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-[#0F172A]">No notification logs recorded</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Dispatched alerts and test messages will be archived here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                    <th className="p-3">TYPE</th>
                    <th className="p-3">RECIPIENT</th>
                    <th className="p-3">SUBJECT</th>
                    <th className="p-3">PROVIDER MESSAGE ID</th>
                    <th className="p-3">STATUS</th>
                    <th className="p-3 text-right">DISPATCHED AT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {filteredNotifications.map((notif: any) => (
                    <tr key={notif.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-slate-100 text-slate-700">
                          {notif.type}
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-slate-900 font-mono text-[11px]">
                        {notif.recipientEmail}
                      </td>
                      <td className="p-3 text-slate-700 max-w-[280px] truncate" title={notif.subject}>
                        {notif.subject}
                      </td>
                      <td className="p-3 font-mono text-[10.5px] text-slate-500">
                        {notif.providerMessageId || '—'}
                      </td>
                      <td className="p-3">
                        {notif.status === 'SENT' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                            SENT
                          </span>
                        ) : notif.status === 'QUEUED' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-purple-50 text-purple-700 border border-purple-200">
                            QUEUED
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-red-50 text-red-700 border border-red-200">
                            FAILED
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right font-mono text-[11px] text-slate-500">
                        <div className="flex items-center justify-end gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{new Date(notif.sentAt).toLocaleTimeString()}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
