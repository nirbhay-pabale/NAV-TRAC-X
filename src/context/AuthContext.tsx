import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { UserSession, UserRole } from '../types/recipientUser';
import type { AuthCredentials, AuthResult } from '../types';

interface AuthContextType {
  user: UserSession | null;
  isAuthenticated: boolean;
  role: 'investigator' | 'normal_user';
  isNormalUser: boolean;
  isInvestigator: boolean;
  login: (credentials: AuthCredentials) => Promise<AuthResult>;
  cacLogin: (targetRole?: UserRole) => Promise<AuthResult>;
  logout: () => void;
  updateUserKeyStatus: (status: 'Active' | 'Revoked' | 'Expiring Soon') => void;
}

const DEFAULT_NORMAL_USER: UserSession = {
  userId: 'REC-05',
  name: 'Lt. Priya Singh',
  rank: 'Lieutenant',
  pno: '06244-S',
  unit: 'INS Visakhapatnam (D66)',
  email: 'lt.priya.singh@navy.mil.in',
  clearanceLevel: 'Level 3 (Secret)',
  role: 'normal_user',
  deviceId: 'HW-HSM-9402',
  deviceName: 'Tactical Console Alpha-1 (D66)',
  isDeviceRegistered: true,
  keyFingerprint: '0xKEM-768: 33BB:7711:00AA:55FF',
  keyStatus: 'Active',
  lastLoginTime: '28 Sep 2026, 08:30 IST',
  token: 'NAVTRAC-JWT-OFF-06244S-PQC-VALID',
};

const DEFAULT_INVESTIGATOR: UserSession = {
  userId: 'INV-0042',
  name: 'Lt. Cdr. S. Rao',
  rank: 'Lt. Commander',
  pno: '05190-M',
  unit: 'Western Naval Command (WNC Mumbai)',
  email: 'cdr.s.rao@navy.mil.in',
  clearanceLevel: 'Level 4 (Top Secret Codeword)',
  role: 'investigator',
  deviceId: 'NAV-HQ-WNC-01',
  deviceName: 'Forensic Lab Workstation 04',
  isDeviceRegistered: true,
  keyFingerprint: '0xKEM-768: 12FE:9981:AA34:7700',
  keyStatus: 'Active',
  lastLoginTime: '28 Sep 2026, 07:45 IST',
  token: 'NAVTRAC-JWT-INV-05190M-PQC-VALID',
};

// Known user accounts for credential verification
const KNOWN_ACCOUNTS: Record<string, { role: 'normal_user' | 'investigator'; session: UserSession }> = {
  'lt.priya.singh@navy.mil.in': { role: 'normal_user', session: DEFAULT_NORMAL_USER },
  'p.singh@navy.mil.in': { role: 'normal_user', session: DEFAULT_NORMAL_USER },
  'cdr.s.rao@navy.mil.in': { role: 'investigator', session: DEFAULT_INVESTIGATOR },
  's.rao@navy.mil.in': { role: 'investigator', session: DEFAULT_INVESTIGATOR },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(() => {
    try {
      const saved = localStorage.getItem('navtrac_session_user');
      if (saved) {
        return JSON.parse(saved);
      }
      const legacyRole = localStorage.getItem('navtrac_active_role');
      if (legacyRole === 'normal_user') return DEFAULT_NORMAL_USER;
      if (legacyRole === 'investigator') return DEFAULT_INVESTIGATOR;
      return DEFAULT_INVESTIGATOR;
    } catch {
      return DEFAULT_INVESTIGATOR;
    }
  });

  const role = user?.role || 'investigator';
  const isAuthenticated = !!user;
  const isNormalUser = role === 'normal_user';
  const isInvestigator = role === 'investigator';

  // Persist session
  useEffect(() => {
    if (user) {
      localStorage.setItem('navtrac_session_user', JSON.stringify(user));
      localStorage.setItem('navtrac_active_role', user.role);
      localStorage.setItem('navtrac_active_user', user.name);
      localStorage.setItem('navtrac_active_id', user.userId);
    } else {
      localStorage.removeItem('navtrac_session_user');
      localStorage.removeItem('navtrac_active_role');
      localStorage.removeItem('navtrac_active_user');
      localStorage.removeItem('navtrac_active_id');
    }
  }, [user]);

  // Session idle timeout handling
  useEffect(() => {
    let timeoutId: number;

    const resetTimer = () => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        // Idle tracking
      }, 15 * 60 * 1000);
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach((evt) => window.addEventListener(evt, resetTimer, { passive: true }));
    resetTimer();

    return () => {
      window.clearTimeout(timeoutId);
      events.forEach((evt) => window.removeEventListener(evt, resetTimer));
    };
  }, []);

  const login = useCallback(async (credentials: AuthCredentials): Promise<AuthResult> => {
    await new Promise((resolve) => setTimeout(resolve, 600));

    const emailKey = credentials.username.trim().toLowerCase();
    const account = KNOWN_ACCOUNTS[emailKey];

    if (!credentials.password || credentials.password.length < 4) {
      return { success: false, errorMessage: 'Invalid credentials' };
    }

    const requestedRole = credentials.role || 'normal_user';

    let matchedSession: UserSession;

    if (account) {
      if (account.role !== requestedRole) {
        return {
          success: false,
          errorMessage: 'Invalid credentials',
        };
      }
      matchedSession = {
        ...account.session,
        lastLoginTime: new Date().toLocaleString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          timeZoneName: 'short',
        }),
      };
    } else {
      if (requestedRole === 'normal_user') {
        matchedSession = {
          ...DEFAULT_NORMAL_USER,
          email: credentials.username,
          lastLoginTime: new Date().toLocaleString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZoneName: 'short',
          }),
        };
      } else {
        matchedSession = {
          ...DEFAULT_INVESTIGATOR,
          email: credentials.username,
          lastLoginTime: new Date().toLocaleString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZoneName: 'short',
          }),
        };
      }
    }

    setUser(matchedSession);

    return {
      success: true,
      role: matchedSession.role,
      userName: matchedSession.name,
      userIdentifier: matchedSession.userId,
      token: matchedSession.token,
    };
  }, []);

  const cacLogin = useCallback(async (targetRole?: UserRole): Promise<AuthResult> => {
    await new Promise((resolve) => setTimeout(resolve, 800));

    const selected = targetRole === 'normal_user' ? DEFAULT_NORMAL_USER : DEFAULT_INVESTIGATOR;
    const session = {
      ...selected,
      lastLoginTime: new Date().toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short',
      }),
    };

    setUser(session);

    return {
      success: true,
      role: session.role,
      userName: session.name,
      userIdentifier: session.userId,
      token: session.token,
    };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('navtrac_session_user');
    localStorage.removeItem('navtrac_active_role');
    localStorage.removeItem('navtrac_active_user');
    localStorage.removeItem('navtrac_active_id');
  }, []);

  const updateUserKeyStatus = useCallback((newStatus: 'Active' | 'Revoked' | 'Expiring Soon') => {
    setUser((prev) => (prev ? { ...prev, keyStatus: newStatus } : null));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        role,
        isNormalUser,
        isInvestigator,
        login,
        cacLogin,
        logout,
        updateUserKeyStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
