import type { ReactNode } from 'react';

export type UserRole = 'investigator' | 'normal_user';

export interface FeatureItem {
  id: string;
  icon: 'secure' | 'provenance' | 'excellence' | 'nation' | ReactNode;
  titleLine1: string;
  titleLine2: string;
  subLine1: string;
  subLine2: string;
  ringGlowType: 'blue' | 'teal' | 'cyan' | 'gold' | 'purple';
}

export interface AuthCredentials {
  username: string;
  password: string;
  rememberMe: boolean;
  role?: UserRole;
}

export interface AuthResult {
  success: boolean;
  errorMessage?: string;
  token?: string;
  role?: UserRole;
  userIdentifier?: string;
  userName?: string;
}

export interface StorageAdapter {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
}

export interface NavTracLoginPageProps {
  heroImageUrl?: string;
  appName?: string;
  appAccentLetter?: string;
  orgTitle?: string;
  systemSubtitle?: string;
  taglineItems?: string[];
  quoteLead?: string;
  quoteGold?: string;
  quoteSubtext?: string;
  features?: FeatureItem[];
  welcomeLabel?: string;
  loginHeading?: string;
  loginSubtext?: string;
  usernameLabel?: string;
  usernamePlaceholder?: string;
  passwordLabel?: string;
  passwordPlaceholder?: string;
  rememberMeLabel?: string;
  forgotPasswordLabel?: string;
  primaryButtonText?: string;
  cacButtonText?: string;
  footerClassification?: string;
  bottomBrandName?: string;
  initialRole?: UserRole;
  onAuthenticate: (credentials: AuthCredentials) => Promise<AuthResult>;
  onCacLogin?: (role?: UserRole) => Promise<void> | void;
  onForgotPassword?: () => void;
  storageAdapter?: StorageAdapter;
}
