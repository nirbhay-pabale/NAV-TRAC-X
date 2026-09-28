import {
  Home,
  FileText,
  Users,
  Database,
  Search,
  ShieldCheck,
  Radio,
  type LucideIcon,
} from 'lucide-react';
import type { UserRole } from '../types/recipientUser';

export type PermissionAction =
  | 'view_own_dashboard'
  | 'view_own_documents'
  | 'open_secure_document'
  | 'create_access_request'
  | 'view_own_activity'
  | 'manage_own_keys'
  | 'report_security_concern'
  | 'view_command_center'
  | 'distribute_documents'
  | 'manage_recipients'
  | 'view_ledger'
  | 'investigate_leaks'
  | 'manage_authorization_policies'
  | 'approve_access_requests'
  | 'manage_emcon_posture';

export type Resource =
  | 'dashboard'
  | 'documents'
  | 'access_requests'
  | 'activity'
  | 'keys'
  | 'command_center'
  | 'distribution'
  | 'recipients'
  | 'ledger'
  | 'investigations'
  | 'authorization'
  | 'emcon';

/**
 * Capability-based Access Control Matrix
 */
const ROLE_PERMISSIONS: Record<UserRole, PermissionAction[]> = {
  normal_user: [
    'view_own_dashboard',
    'view_own_documents',
    'open_secure_document',
    'create_access_request',
    'view_own_activity',
    'manage_own_keys',
    'report_security_concern',
  ],
  recipient: [
    'view_own_dashboard',
    'view_own_documents',
    'open_secure_document',
    'create_access_request',
    'view_own_activity',
    'manage_own_keys',
    'report_security_concern',
  ],
  investigator: [
    'view_command_center',
    'distribute_documents',
    'view_own_documents',
    'manage_recipients',
    'view_ledger',
    'investigate_leaks',
    'manage_authorization_policies',
    'approve_access_requests',
    'manage_emcon_posture',
    'view_own_activity',
    'manage_own_keys',
  ],
};

/**
 * Checks whether a given role is allowed to perform an action on a resource.
 */
export function can(action: PermissionAction, _resource: Resource, role?: UserRole | string | null): boolean {
  if (!role) return false;
  const normalizedRole = (role === 'recipient' ? 'normal_user' : role) as UserRole;
  const permissions = ROLE_PERMISSIONS[normalizedRole] || [];
  return permissions.includes(action);
}

export interface MenuItemConfig {
  to: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
  requiredPermission?: PermissionAction;
}

/**
 * Role-driven Sidebar Menu Configuration
 */
export const RECIPIENT_MENU_CONFIG: MenuItemConfig[] = [
  { to: '/my/dashboard', label: 'My Dashboard', icon: Home, requiredPermission: 'view_own_dashboard' },
  { to: '/my/documents', label: 'My Documents', icon: FileText, requiredPermission: 'view_own_documents' },
];

export const INVESTIGATOR_MENU_CONFIG: MenuItemConfig[] = [
  { to: '/command-center', label: 'Command Center', icon: Home, requiredPermission: 'view_command_center' },
  { to: '/distribute', label: 'Distribute', icon: FileText, requiredPermission: 'distribute_documents' },
  { to: '/documents', label: 'Documents', icon: FileText, requiredPermission: 'view_own_documents' },
  { to: '/recipients', label: 'Recipients', icon: Users, requiredPermission: 'manage_recipients' },
  { to: '/ledger', label: 'Ledger', icon: Database, requiredPermission: 'view_ledger' },
  { to: '/investigations/INV-2026-0042', label: 'Investigations', icon: Search, requiredPermission: 'investigate_leaks' },
  { to: '/authorization', label: 'Authorization', icon: ShieldCheck, requiredPermission: 'manage_authorization_policies' },
  { to: '/emcon', label: 'EMCON', icon: Radio, requiredPermission: 'manage_emcon_posture' },
];

export function getMenuForRole(role?: UserRole | string | null): MenuItemConfig[] {
  if (role === 'normal_user' || role === 'recipient') {
    return RECIPIENT_MENU_CONFIG;
  }
  return INVESTIGATOR_MENU_CONFIG;
}
