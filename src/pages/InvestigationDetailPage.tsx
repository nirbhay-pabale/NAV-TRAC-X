import React from 'react';
import { useParams } from 'react-router-dom';
import { ForensicWorkbench } from '../components/investigations/ForensicWorkbench';

export const InvestigationDetailPage: React.FC = () => {
  const { caseId = 'INV-2026-0042' } = useParams<{ caseId: string }>();

  return (
    <ForensicWorkbench
      caseId={caseId}
      isNewCase={false}
    />
  );
};

export default InvestigationDetailPage;
