import { useState } from 'react';
import type { SystemModeData } from '../types/commandCenter';

export interface ExtendedSystemModeData extends SystemModeData {
  pqcStatus: string;
  pqcStandard: string;
  isPqcActive: boolean;
}

export const useSystemMode = () => {
  const [modeData, setModeData] = useState<ExtendedSystemModeData>({
    mode: 'EMCON_AIR_GAPPED',
    isAirGapped: true,
    label: 'EMCON MODE',
    sublabel: 'AIR-GAPPED',
    transmissionAllowed: false,
    pqcStatus: 'PQC ACTIVE',
    pqcStandard: 'NIST FIPS 203/204',
    isPqcActive: true
  });

  const toggleEmconMode = () => {
    setModeData((prev) => {
      if (prev.mode === 'EMCON_AIR_GAPPED') {
        return {
          ...prev,
          mode: 'STANDARD_SECURE',
          isAirGapped: false,
          label: 'SECURE LINK',
          sublabel: 'ONLINE ENCRYPTED',
          transmissionAllowed: true
        };
      } else {
        return {
          ...prev,
          mode: 'EMCON_AIR_GAPPED',
          isAirGapped: true,
          label: 'EMCON MODE',
          sublabel: 'AIR-GAPPED',
          transmissionAllowed: false
        };
      }
    });
  };

  const togglePqcMode = () => {
    setModeData((prev) => ({
      ...prev,
      isPqcActive: !prev.isPqcActive,
      pqcStatus: !prev.isPqcActive ? 'PQC ACTIVE' : 'PQC DEGRADED',
      pqcStandard: !prev.isPqcActive ? 'NIST FIPS 203/204' : 'CLASSICAL RSA-4096'
    }));
  };

  return {
    ...modeData,
    toggleEmconMode,
    togglePqcMode
  };
};
