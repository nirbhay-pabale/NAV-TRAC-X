import React, { useState } from 'react';
import { UserPlus, X, CheckCircle2, Key } from 'lucide-react';

interface AddRecipientModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddRecipientModal: React.FC<AddRecipientModalProps> = ({
  isOpen,
  onClose
}) => {
  const [recipientName, setRecipientName] = useState('');
  const [unitCode, setUnitCode] = useState('');
  const [clearance, setClearance] = useState('LEVEL 4 (TOP SECRET)');
  const [publicKey, setPublicKey] = useState('0x9F42...C108');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1600);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl bg-[#08162b] border border-teal-500/40 shadow-2xl p-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-700/60 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-[#2dd4bf]">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-['Montserrat']">
                Authorize New Recipient
              </h3>
              <p className="text-xs text-[#8EABC1]">PKI Key Registry & Security Clearance</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-10 text-center flex flex-col items-center">
            <CheckCircle2 className="w-12 h-12 text-teal-400 mb-3 animate-bounce" />
            <h4 className="text-base font-bold text-white">Recipient Node Authorized</h4>
            <p className="text-xs text-slate-400 mt-1">Cryptographic PKI Certificate Registered</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Unit / Officer Full Name</label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="e.g. CDR. K. VERMA / INS KOLKATA"
                className="w-full bg-[#040b15] border border-sky-500/30 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-teal-400"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Unit Call Sign / Code</label>
                <input
                  type="text"
                  value={unitCode}
                  onChange={(e) => setUnitCode(e.target.value)}
                  placeholder="e.g. D63-NAV-01"
                  className="w-full bg-[#040b15] border border-sky-500/30 rounded-xl px-3.5 py-2 text-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Clearance Level</label>
                <select
                  value={clearance}
                  onChange={(e) => setClearance(e.target.value)}
                  className="w-full bg-[#040b15] border border-sky-500/30 rounded-xl px-3 py-2 text-emerald-300 font-bold focus:outline-none"
                >
                  <option>LEVEL 1 (RESTRICTED)</option>
                  <option>LEVEL 2 (CONFIDENTIAL)</option>
                  <option>LEVEL 3 (SECRET)</option>
                  <option>LEVEL 4 (TOP SECRET)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Hardware Security Module (HSM) Public Key</label>
              <div className="relative">
                <input
                  type="text"
                  value={publicKey}
                  onChange={(e) => setPublicKey(e.target.value)}
                  className="w-full bg-[#040b15] border border-sky-500/30 rounded-xl pl-9 pr-3.5 py-2 text-sky-200 font-mono focus:outline-none"
                  required
                />
                <Key className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              </div>
            </div>

            {/* Submit button */}
            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold transition-all shadow-[0_0_15px_rgba(45,212,191,0.5)]"
              >
                {isSubmitting ? 'Registering PKI Node…' : 'Authorize Recipient'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
