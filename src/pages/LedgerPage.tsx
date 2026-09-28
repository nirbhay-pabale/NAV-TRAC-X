import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { LedgerHeader } from '../components/ledger/LedgerHeader';
import { LedgerTopControls } from '../components/ledger/LedgerTopControls';
import { BlockExplorer } from '../components/ledger/BlockExplorer';
import { ReconciliationView } from '../components/ledger/ReconciliationView';
import { ChainVerificationModal } from '../components/ledger/ChainVerificationModal';
import { TamperConfirmModal } from '../components/ledger/TamperConfirmModal';
import { useTamperSimulation, useVerifyChain, useExportLedgerSegment } from '../hooks/useLedgerData';
import type { ChainVerificationResult } from '../types/ledger';

export const LedgerPage: React.FC = () => {
  const { blockId } = useParams<{ blockId?: string }>();
  const [activeView, setActiveView] = useState<'explorer' | 'reconciliation'>('explorer');

  // Tamper simulation state
  const { isTamperedState, tamperedBlockNum, simulateTamper, resetDemo } = useTamperSimulation();
  const [isTamperModalOpen, setIsTamperModalOpen] = useState(false);

  // Verification modal state
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [verificationResult, setVerificationResult] = useState<ChainVerificationResult | null>(null);
  const verifyChainMutation = useVerifyChain();

  // Export mutation
  const exportMutation = useExportLedgerSegment();

  const handleStartVerification = async () => {
    setIsVerifyModalOpen(true);
    setVerificationResult(null);
    try {
      const result = await verifyChainMutation.mutateAsync();
      setVerificationResult(result);
    } catch (err) {
      console.error('Verification error:', err);
    }
  };

  const handleConfirmTamper = () => {
    simulateTamper();
    setIsTamperModalOpen(false);
  };

  const handleExportEvidence = async () => {
    try {
      await exportMutation.mutateAsync({ startBlock: 4188, endBlock: 4192 });
    } catch (err) {
      console.error('Export error:', err);
    }
  };

  return (
    <div className="relative space-y-4 animate-fadeIn pb-10 min-h-screen">
      {/* Confined Warship Silhouette Overlay in Header Banner */}
      <div
        className="pointer-events-none absolute top-0 right-0 w-[550px] h-[190px] opacity-25 mix-blend-screen bg-contain bg-no-repeat bg-right-top z-0"
        style={{
          backgroundImage: `url('/Login_BG.png')`,
          maskImage: 'linear-gradient(to bottom, black 30%, transparent 95%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 30%, transparent 95%)',
        }}
      />

      {/* Header */}
      <LedgerHeader />

      {/* Top Action Controls & Live Status */}
      <LedgerTopControls
        activeView={activeView}
        onViewChange={setActiveView}
        onVerifyChain={handleStartVerification}
        isVerifying={verifyChainMutation.isPending}
        isTamperedState={isTamperedState}
        tamperedBlockNum={tamperedBlockNum}
        onOpenTamperModal={() => setIsTamperModalOpen(true)}
        onResetDemo={resetDemo}
        onExportEvidence={handleExportEvidence}
        isExporting={exportMutation.isPending}
      />

      {/* Active Tab View */}
      {activeView === 'explorer' ? (
        <BlockExplorer initialBlockId={blockId} />
      ) : (
        <ReconciliationView />
      )}

      {/* Chain Verification Progress & Result Modal */}
      <ChainVerificationModal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        isVerifying={verifyChainMutation.isPending}
        result={verificationResult}
      />

      {/* Tamper Simulation Confirmation Dialog */}
      <TamperConfirmModal
        isOpen={isTamperModalOpen}
        onClose={() => setIsTamperModalOpen(false)}
        onConfirm={handleConfirmTamper}
      />
    </div>
  );
};

export default LedgerPage;
