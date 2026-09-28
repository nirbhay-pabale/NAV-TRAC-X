import React from 'react';
import { ForensicWorkbench } from '../components/investigations/ForensicWorkbench';

export const NewInvestigationPage: React.FC = () => {
  return (
    <ForensicWorkbench
      isNewCase={true}
    />
  );
};

export default NewInvestigationPage;
