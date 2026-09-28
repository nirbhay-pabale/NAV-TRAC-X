export type AccessType = 'view' | 'download' | 'print' | 'edit';

export type RecipientCategory = 'Users' | 'Groups' | 'Units' | 'External Agencies';

export interface RecipientItem {
  id: string;
  name: string;
  unit: string;
  role: string;
  category: RecipientCategory;
  initials: string;
  isAuthorized: boolean;
  clearanceLevel: string;
}

export interface AdvancedRestrictions {
  dynamicWatermarking: boolean;
  screenCaptureProtection: boolean;
  deviceBinding: boolean;
}

export interface DistributionPayload {
  document: {
    name: string;
    size: string;
    type: string;
    classification: string;
  };
  recipients: RecipientItem[];
  accessType: AccessType;
  advancedRestrictions: AdvancedRestrictions;
  watermarkPolicy: 'dynamic-per-recipient' | 'none';
  screenCaptureProtection: boolean;
  deviceBinding: boolean;
  validityWindow: {
    durationDays: number;
    startDate: string;
    endDate: string;
  };
  accessReason: string;
}

export interface DistributionFormState {
  file: File | null;
  fileMeta: {
    name: string;
    size: string;
    type: string;
    classification: string;
  } | null;
  selectedRecipients: string[];
  activeTab: RecipientCategory;
  searchQuery: string;
  accessType: AccessType;
  advancedExpanded: boolean;
  restrictions: AdvancedRestrictions;
  validityPreset: string;
  dateRangeText: string;
  accessReason: string;
}
