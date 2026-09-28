import React, { useState } from 'react';
import { RecipientHeader } from '../components/recipients/RecipientHeader';
import { RecipientStatCards } from '../components/recipients/RecipientStatCards';
import { RecipientFilterBar } from '../components/recipients/RecipientFilterBar';
import { RecipientTable } from '../components/recipients/RecipientTable';
import { RecipientDetailsDrawer } from '../components/recipients/RecipientDetailsDrawer';
import { WatermarkVisualizationModal } from '../components/modals/WatermarkVisualizationModal';
import { ActionConfirmModal } from '../components/modals/ActionConfirmModal';
import { useRecipients } from '../hooks/useRecipients';
import type { RecipientFilters, RecipientRecord } from '../types/recipient';

export const RecipientsPage: React.FC = () => {
  const initialFilters: RecipientFilters = {
    documentId: 'All Documents',
    recipientType: 'All Types',
    unitVessel: 'All Units',
    accessStatus: 'All Status',
    dateRange: '27 Sep 2026 – 04 Oct 2026',
    searchQuery: '',
    page: 1,
    pageSize: 8,
  };

  const [filters, setFilters] = useState<RecipientFilters>(initialFilters);
  const { data: response } = useRecipients(filters);

  // Selected recipient for right drawer (defaults to first recipient REC-001)
  const [selectedRecipientId, setSelectedRecipientId] = useState<string | null>('REC-001');
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);

  // Modals state
  const [watermarkModalOpen, setWatermarkModalOpen] = useState(false);
  const [watermarkTargetRecipient, setWatermarkTargetRecipient] = useState<RecipientRecord | null>(null);

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'suspend' | 'revoke' | 'export' | 'rotateKey' | null>(null);
  const [actionTargetRecipient, setActionTargetRecipient] = useState<RecipientRecord | null>(null);

  const recipients = response?.recipients ?? [];
  const selectedRecipient = recipients.find((r) => r.id === selectedRecipientId) || (recipients.length > 0 ? recipients[0] : null);

  const handleFilterChange = (newFilters: Partial<RecipientFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: newFilters.page ?? 1 }));
  };

  const handleResetFilters = () => {
    setFilters(initialFilters);
  };

  const handleSelectRecipient = (recipient: RecipientRecord) => {
    setSelectedRecipientId(recipient.id);
    setIsDrawerOpen(true);
  };

  const handleOpenDocuments = (recipient: RecipientRecord) => {
    setSelectedRecipientId(recipient.id);
    setIsDrawerOpen(true);
  };

  const handleOpenChain = (recipient: RecipientRecord) => {
    setSelectedRecipientId(recipient.id);
    setIsDrawerOpen(true);
  };

  const handleOpenWatermarkDemo = (recipient: RecipientRecord) => {
    setWatermarkTargetRecipient(recipient);
    setWatermarkModalOpen(true);
  };

  const handleActionRequest = (
    type: 'suspend' | 'revoke' | 'export' | 'rotateKey',
    recipient: RecipientRecord
  ) => {
    setActionType(type);
    setActionTargetRecipient(recipient);
    setConfirmModalOpen(true);
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

      {/* Page Header */}
      <RecipientHeader />

      {/* 4 Stat Cards Row */}
      <RecipientStatCards
        onFilterChange={(status) => handleFilterChange({ accessStatus: status })}
      />

      {/* 5-Control Filter Bar */}
      <RecipientFilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Main Content Area: Left Table & Right Details Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start relative z-10">
        {/* Recipient Table: 100% when drawer is closed, ~64% (col-span-7 or 8) when drawer is open */}
        <div className={`transition-all duration-300 ${isDrawerOpen ? 'lg:col-span-7 xl:col-span-7 2xl:col-span-8' : 'lg:col-span-12'}`}>
          <RecipientTable
            recipients={recipients}
            selectedRecipientId={isDrawerOpen ? selectedRecipientId : null}
            onSelectRecipient={handleSelectRecipient}
            onOpenDocuments={handleOpenDocuments}
            onOpenChain={handleOpenChain}
            onActionRequest={handleActionRequest}
            currentPage={filters.page}
            totalPages={response?.totalPages ?? 11}
            totalCount={response?.totalCount ?? 86}
            onPageChange={(page) => handleFilterChange({ page })}
          />
        </div>

        {/* Recipient Details Drawer: ~36% (col-span-5 or 4) */}
        {isDrawerOpen && selectedRecipient && (
          <div className="lg:col-span-5 xl:col-span-5 2xl:col-span-4 sticky top-20 transition-all duration-300">
            <RecipientDetailsDrawer
              recipient={selectedRecipient}
              onClose={() => setIsDrawerOpen(false)}
              onOpenWatermarkDemo={handleOpenWatermarkDemo}
              onActionRequest={handleActionRequest}
            />
          </div>
        )}
      </div>

      {/* Steganographic Forensic Watermark Inspection Demo Modal */}
      <WatermarkVisualizationModal
        isOpen={watermarkModalOpen}
        onClose={() => setWatermarkModalOpen(false)}
        recipient={watermarkTargetRecipient || selectedRecipient}
      />

      {/* Action Confirmation Modal */}
      <ActionConfirmModal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        actionType={actionType}
        recipient={actionTargetRecipient || selectedRecipient}
        onConfirm={() => {
          // Trigger any query invalidation or refresh
        }}
      />
    </div>
  );
};
