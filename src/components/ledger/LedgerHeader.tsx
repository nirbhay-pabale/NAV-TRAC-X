import { Database } from 'lucide-react';

export const LedgerHeader: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-[#0F172A] tracking-tight">
            Tamper-Evident Sovereign Ledger
          </h1>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            Chain Verified
          </span>
        </div>
        <p className="text-xs text-[#64748B] mt-0.5">
          Every decryption event and access log is cryptographically chained with ML-DSA-65 signatures and zero-knowledge proofs.
        </p>
      </div>

      <div className="flex items-center gap-2 font-mono text-xs text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
        <Database className="w-3.5 h-3.5 text-blue-600" />
        <span>Current Height: <strong className="text-slate-900">#4,192</strong></span>
      </div>
    </div>
  );
};

export default LedgerHeader;
