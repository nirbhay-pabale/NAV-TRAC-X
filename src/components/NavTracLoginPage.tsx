import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  Shield,
  ShieldCheck,
  GitFork,
  Target,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { NavalCrest } from './NavalCrest';
import defaultLoginBg from '../assets/Login_BG.png';
import type {
  NavTracLoginPageProps,
  FeatureItem,
  AuthCredentials,
  StorageAdapter,
  UserRole
} from '../types';

const defaultStorageAdapter: StorageAdapter = {
  getItem: (key: string) => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Fallback
    }
  },
  removeItem: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch {
      // Fallback
    }
  }
};

const defaultFeatures: FeatureItem[] = [
  {
    id: 'secure-docs',
    icon: 'secure',
    titleLine1: 'SECURE',
    titleLine2: 'DOCUMENTS',
    subLine1: 'Tamper-proof &',
    subLine2: 'Encrypted',
    ringGlowType: 'blue'
  },
  {
    id: 'provenance',
    icon: 'provenance',
    titleLine1: 'TRANSPARENT',
    titleLine2: 'PROVENANCE',
    subLine1: 'End-to-End',
    subLine2: 'Traceability',
    ringGlowType: 'teal'
  },
  {
    id: 'excellence',
    icon: 'excellence',
    titleLine1: 'OPERATIONAL',
    titleLine2: 'EXCELLENCE',
    subLine1: 'Smarter Decision',
    subLine2: 'Making',
    ringGlowType: 'gold'
  },
  {
    id: 'safer-nation',
    icon: 'nation',
    titleLine1: 'A SAFER',
    titleLine2: 'NATION',
    subLine1: 'Powered by',
    subLine2: 'Indian Navy',
    ringGlowType: 'purple'
  }
];

export const NavTracLoginPage: React.FC<NavTracLoginPageProps> = ({
  heroImageUrl = defaultLoginBg,
  appName = 'NAV-TRAC',
  appAccentLetter = 'X',
  orgTitle = 'Indian Navy',
  systemSubtitle = 'Secure Provenance System',
  taglineItems = ['TRUSTED DOCUMENTS', 'SECURE OPERATIONS', 'STRONGER NATION'],
  quoteLead = 'Secure Today,',
  quoteGold = 'Stronger Tomorrow.”',
  quoteSubtext = 'Because every document carries a mission,\nand every mission builds a safer nation.',
  features = defaultFeatures,
  welcomeLabel = 'WELCOME BACK',
  loginHeading = 'LOGIN',
  loginSubtext = 'Access your command center',
  usernameLabel = 'USERNAME / EMAIL',
  passwordLabel = 'PASSWORD',
  rememberMeLabel = 'Remember me',
  forgotPasswordLabel = 'Forgot Password?',
  cacButtonText = 'Login with CAC / Smart Card',
  footerClassification = 'Authorized Personnel Only',
  bottomBrandName = 'INDIAN NAVY  |  NAV-TRAC X',
  initialRole = 'investigator',
  onAuthenticate,
  onCacLogin,
  onForgotPassword,
  storageAdapter = defaultStorageAdapter
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(() => {
    const savedRole = storageAdapter.getItem('navtrac_active_role');
    return (savedRole === 'normal_user' || savedRole === 'investigator') ? savedRole : initialRole;
  });

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCacSubmitting, setIsCacSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync default credentials preview when switching roles
  useEffect(() => {
    if (selectedRole === 'normal_user') {
      setUsername('lt.priya.singh@navy.mil.in');
      setPassword('Navy@User2026');
    } else {
      setUsername('cdr.s.rao@navy.mil.in');
      setPassword('Navy@Investigator2026');
    }
  }, [selectedRole]);

  useEffect(() => {
    const savedFlag = storageAdapter.getItem('navtrac_remember_flag');
    if (savedFlag === 'true') {
      setRememberMe(true);
      const savedUser = storageAdapter.getItem('navtrac_saved_identifier');
      if (savedUser) {
        setUsername(savedUser);
      }
    }
  }, [storageAdapter]);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    storageAdapter.setItem('navtrac_active_role', role);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!username.trim() || !password.trim()) {
      setErrorMessage('Invalid credentials');
      return;
    }

    setIsSubmitting(true);
    try {
      const credentials: AuthCredentials = {
        username: username.trim(),
        password,
        rememberMe,
        role: selectedRole
      };

      if (rememberMe) {
        storageAdapter.setItem('navtrac_remember_flag', 'true');
        storageAdapter.setItem('navtrac_saved_identifier', username.trim());
      } else {
        storageAdapter.removeItem('navtrac_remember_flag');
        storageAdapter.removeItem('navtrac_saved_identifier');
      }

      storageAdapter.setItem('navtrac_active_role', selectedRole);

      const result = await onAuthenticate(credentials);
      if (!result.success) {
        setErrorMessage(result.errorMessage || 'Invalid credentials');
      }
    } catch {
      setErrorMessage('Invalid credentials');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = (role: UserRole) => {
    handleRoleSelect(role);
    const u = role === 'normal_user' ? 'lt.priya.singh@navy.mil.in' : 'cdr.s.rao@navy.mil.in';
    const p = role === 'normal_user' ? 'Navy@User2026' : 'Navy@Investigator2026';
    setUsername(u);
    setPassword(p);
    storageAdapter.setItem('navtrac_active_role', role);

    onAuthenticate({
      username: u,
      password: p,
      rememberMe: true,
      role
    });
  };

  const handleCacClick = async () => {
    if (!onCacLogin || isCacSubmitting) return;
    setErrorMessage(null);
    setIsCacSubmitting(true);
    try {
      storageAdapter.setItem('navtrac_active_role', selectedRole);
      await onCacLogin(selectedRole);
    } catch {
      setErrorMessage('CAC / Smart Card Authentication Failed');
    } finally {
      setIsCacSubmitting(false);
    }
  };

  const renderFeatureIcon = (item: FeatureItem) => {
    if (typeof item.icon !== 'string') {
      return item.icon;
    }
    switch (item.icon) {
      case 'secure':
        return <ShieldCheck className="w-5 h-5 text-[#38bdf8]" />;
      case 'provenance':
        return <GitFork className="w-5 h-5 text-[#2dd4bf]" />;
      case 'excellence':
        return <Shield className="w-5 h-5 text-[#fbbf24]" />;
      case 'nation':
        return <Target className="w-5 h-5 text-[#a78bfa]" />;
      default:
        return <ShieldCheck className="w-5 h-5 text-[#38bdf8]" />;
    }
  };

  const getRingGlowClass = (glowType: FeatureItem['ringGlowType']) => {
    switch (glowType) {
      case 'blue':
        return 'badge-glow-blue';
      case 'teal':
      case 'cyan':
        return 'badge-glow-teal';
      case 'gold':
        return 'badge-glow-gold';
      case 'purple':
        return 'badge-glow-purple';
      default:
        return 'badge-glow-blue';
    }
  };

  return (
    <main className="relative min-h-screen w-full bg-[#05101f] text-white flex flex-col justify-between overflow-x-hidden select-none">
      {/* Background Image: Login_BG.png */}
      <div
        className="absolute inset-0 z-0 bg-no-repeat transition-opacity duration-1000"
        style={{
          backgroundImage: `url(${heroImageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 40%'
        }}
        role="img"
        aria-label="Naval frigate at sunset"
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(to right, rgba(6, 14, 28, 0.90) 0%, rgba(6, 14, 28, 0.65) 45%, rgba(6, 14, 28, 0.35) 100%)'
          }}
        />
      </div>

      {/* Main Foreground Container */}
      <div className="relative z-10 w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 py-5 flex-1 flex flex-col justify-between">
        
        {/* Top Header: Brand Block */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="flex items-center gap-3.5"
        >
          <NavalCrest size={48} className="flex-shrink-0" />
          <div className="flex flex-col">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-wider text-white font-['Montserrat'] flex items-center gap-1.5 leading-tight">
              {appName}
              <span className="text-[#f2b134] font-black">{appAccentLetter}</span>
            </h1>
            <span className="text-[12px] font-medium text-[#D6E2ED] tracking-wide leading-tight">
              {orgTitle}
            </span>
            <span className="text-[11px] text-[#8EABC1] font-normal leading-tight">
              {systemSubtitle}
            </span>
          </div>
        </motion.div>

        {/* Center Section: Left Hero Column & Right Wide Glassmorphic Login Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center my-auto py-2">
          
          {/* Left Hero Column */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
            className="lg:col-span-5 xl:col-span-5 flex flex-col justify-center space-y-4"
          >
            {/* Tagline Row */}
            <div className="flex items-center flex-wrap gap-2 text-[11px] font-bold tracking-[0.2em] text-[#7ec8e3] uppercase font-['Montserrat']">
              {taglineItems.map((item, idx) => (
                <React.Fragment key={idx}>
                  <span className="hover:text-cyan-300 transition-colors cursor-default drop-shadow-[0_0_8px_rgba(126,200,227,0.4)]">
                    {item}
                  </span>
                  {idx < taglineItems.length - 1 && (
                    <span className="text-[#7ec8e3]/40 font-light mx-1">|</span>
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Hero Quote Block */}
            <div className="relative pt-1">
              <div className="flex items-start">
                <span className="text-4xl sm:text-5xl font-serif text-[#f2b134] font-black leading-none -mt-2 mr-2 select-none drop-shadow-[0_2px_10px_rgba(242,177,52,0.3)]">
                  “
                </span>
                <div>
                  <h2 className="text-2xl sm:text-3xl lg:text-[36px] font-extrabold font-['Montserrat'] leading-[1.15] tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]">
                    {quoteLead}
                    <br />
                    <span className="text-[#f2b134] drop-shadow-[0_2px_15px_rgba(242,177,52,0.45)]">
                      {quoteGold}
                    </span>
                  </h2>
                </div>
              </div>

              {/* Subtext */}
              <div className="mt-3 pl-6 sm:pl-7">
                <p className="text-xs sm:text-sm text-[#9FB8CE] font-normal leading-relaxed max-w-md whitespace-pre-line drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
                  {quoteSubtext}
                </p>
                <div className="h-[2.5px] w-10 bg-[#f2b134] rounded-full mt-3 shadow-[0_0_8px_rgba(242,177,52,0.6)]" />
              </div>
            </div>

            {/* 4-Item Feature Row */}
            <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-lg">
              {features.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.25 + idx * 0.08 }}
                  className="feature-item-container rounded-xl p-2.5 flex flex-col items-center text-center cursor-default group"
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center mb-1.5 transition-transform duration-300 group-hover:scale-105 ${getRingGlowClass(
                      item.ringGlowType
                    )}`}
                  >
                    {renderFeatureIcon(item)}
                  </div>

                  <div className="text-[10px] font-bold text-white tracking-wide uppercase leading-tight font-['Montserrat'] mb-0.5">
                    <span>{item.titleLine1}</span>
                    <br />
                    <span>{item.titleLine2}</span>
                  </div>

                  <div className="text-[9px] text-[#8FA7BD] leading-tight font-normal">
                    <span>{item.subLine1}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Wide Horizontal Glassmorphic Login Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
            className="lg:col-span-7 xl:col-span-7 flex justify-center lg:justify-end"
          >
            {/* Broader Card Container (max-w-[620px]) */}
            <div className="navtrac-glass-card w-full max-w-[620px] p-5 sm:p-6 sm:px-7 relative overflow-hidden shadow-2xl border border-sky-500/25">
              
              {/* ── CARD HORIZONTAL HEADER ── */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 mb-3.5 border-b border-sky-500/15">
                {/* Left: Brand Identity */}
                <div className="flex items-center gap-3">
                  <NavalCrest size={40} className="flex-shrink-0" />
                  <div className="flex flex-col text-left">
                    <div className="text-base sm:text-lg font-extrabold tracking-wider text-white font-['Montserrat'] flex items-center gap-1 leading-tight">
                      {appName}
                      <span className="text-[#f2b134] font-black">{appAccentLetter}</span>
                    </div>
                    <span className="text-[11px] font-medium text-[#D6E2ED] leading-tight">
                      {orgTitle}
                    </span>
                    <span className="text-[9.5px] text-[#8EABC1] leading-tight">
                      {systemSubtitle}
                    </span>
                  </div>
                </div>

                {/* Right: Welcome Title */}
                <div className="text-right">
                  <span className="text-[10px] font-bold text-[#f2b134] tracking-[0.2em] uppercase font-['Montserrat'] block">
                    {welcomeLabel}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-wide font-['Montserrat'] leading-tight">
                    {loginHeading}
                  </h3>
                  <p className="text-[11px] text-[#A5C2DC]">
                    {loginSubtext}
                  </p>
                </div>
              </div>

              {/* ── ROLE SELECTION TABS & ACTIVE CONTEXT ── */}
              <div className="mb-3.5 p-2 rounded-xl bg-[#040B15]/90 border border-sky-500/20">
                <div className="flex items-center justify-between mb-1.5 px-1">
                  <span className="text-[10px] font-bold text-[#8EABC1] uppercase tracking-wider font-mono">
                    SELECT ACCESS ROLE
                  </span>
                  <span className="text-[10px] font-mono text-sky-300 font-semibold truncate max-w-[260px]">
                    Active: {selectedRole === 'normal_user' ? 'Lt. Priya Singh (Level 3)' : 'Lt. Cdr. S. Rao (Level 4)'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {/* Role 1: Normal User */}
                  <button
                    type="button"
                    onClick={() => handleRoleSelect('normal_user')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold font-['Montserrat'] transition-all flex items-center justify-center gap-2 ${
                      selectedRole === 'normal_user'
                        ? 'bg-blue-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.5)] border border-sky-300'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Normal User</span>
                    <span className="hidden sm:inline text-[9.5px] opacity-75 font-mono font-normal">
                      (Officer / Recipient)
                    </span>
                  </button>

                  {/* Role 2: Investigator */}
                  <button
                    type="button"
                    onClick={() => handleRoleSelect('investigator')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold font-['Montserrat'] transition-all flex items-center justify-center gap-2 ${
                      selectedRole === 'investigator'
                        ? 'bg-blue-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.5)] border border-sky-300'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Investigator</span>
                    <span className="hidden sm:inline text-[9.5px] opacity-75 font-mono font-normal">
                      (Forensic Lead)
                    </span>
                  </button>
                </div>
              </div>

              {/* Error State */}
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="navtrac-error-banner mb-3 p-2 rounded-xl text-red-200 text-xs flex items-center gap-2 justify-center shadow-lg"
                  role="alert"
                >
                  <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span className="font-semibold">{errorMessage}</span>
                </motion.div>
              )}

              {/* ── AUTH FORM: 2 HORIZONTAL INPUT COLUMNS ── */}
              <form onSubmit={handleSubmit} className="space-y-3" noValidate>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Column 1: Username Input */}
                  <div className="navtrac-glass-input px-3.5 py-2.5 flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-sky-900/30 flex items-center justify-center flex-shrink-0 text-slate-200">
                      <User className="w-3.5 h-3.5 text-slate-200" />
                    </div>
                    <div className="flex-1 flex flex-col min-w-0">
                      <label
                        htmlFor="navtrac-username"
                        className="text-[9.5px] font-bold text-[#38bdf8] tracking-wider uppercase font-['Montserrat']"
                      >
                        {usernameLabel}
                      </label>
                      <input
                        id="navtrac-username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder={selectedRole === 'normal_user' ? 'lt.priya.singh@navy.mil.in' : 'cdr.s.rao@navy.mil.in'}
                        tabIndex={1}
                        disabled={isSubmitting}
                        className="bg-transparent text-white text-xs sm:text-[13px] placeholder:text-slate-400/70 focus:outline-none w-full py-0.5 font-normal"
                        autoComplete="username"
                      />
                    </div>
                  </div>

                  {/* Column 2: Password Field */}
                  <div className="navtrac-glass-input px-3.5 py-2.5 flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-sky-900/30 flex items-center justify-center flex-shrink-0 text-slate-200">
                      <Lock className="w-3.5 h-3.5 text-slate-200" />
                    </div>
                    <div className="flex-1 flex flex-col min-w-0">
                      <label
                        htmlFor="navtrac-password"
                        className="text-[9.5px] font-bold text-[#38bdf8] tracking-wider uppercase font-['Montserrat']"
                      >
                        {passwordLabel}
                      </label>
                      <input
                        id="navtrac-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        tabIndex={2}
                        disabled={isSubmitting}
                        className="bg-transparent text-white text-xs sm:text-[13px] placeholder:text-slate-400/70 focus:outline-none w-full py-0.5 font-normal"
                        autoComplete="current-password"
                      />
                    </div>
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="text-slate-400 hover:text-white transition-colors p-1 focus:outline-none rounded"
                    >
                      {showPassword ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password Row */}
                <div className="flex items-center justify-between px-1 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer group select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      tabIndex={3}
                      className="sr-only"
                    />
                    <div
                      className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all duration-200 ${
                        rememberMe
                          ? 'bg-[#38bdf8] border-[#38bdf8] text-[#05101f] shadow-[0_0_6px_rgba(56,189,248,0.6)]'
                          : 'border-slate-500 bg-sky-950/40 group-hover:border-sky-400'
                      }`}
                    >
                      {rememberMe && (
                        <svg
                          className="w-2.5 h-2.5 stroke-current stroke-3 fill-none"
                          viewBox="0 0 24 24"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                    <span className="text-slate-300 group-hover:text-white transition-colors text-[11px]">
                      {rememberMeLabel}
                    </span>
                  </label>

                  <button
                    type="button"
                    onClick={onForgotPassword}
                    tabIndex={4}
                    className="text-[#38bdf8] hover:text-sky-300 hover:underline transition-colors text-[11px] font-medium"
                  >
                    {forgotPasswordLabel}
                  </button>
                </div>

                {/* ── ACTION BUTTONS ROW (Primary Sign In + CAC Smart Card) ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {/* Primary Sign In Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    tabIndex={5}
                    className="navtrac-btn-primary py-2.5 px-4 font-bold text-xs sm:text-sm tracking-wide uppercase font-['Montserrat'] flex items-center justify-center gap-2 shadow-md hover:shadow-[0_0_15px_rgba(30,64,175,0.6)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                        <span>Authenticating…</span>
                      </>
                    ) : (
                      <>
                        <LogIn className="w-3.5 h-3.5" />
                        <span>
                          {selectedRole === 'normal_user'
                            ? 'Sign In as Normal User'
                            : 'Sign In as Investigator'}
                        </span>
                      </>
                    )}
                  </button>

                  {/* CAC Smart Card Button */}
                  <button
                    type="button"
                    onClick={handleCacClick}
                    disabled={isCacSubmitting}
                    className="py-2.5 px-4 rounded-xl bg-[#040B15]/90 hover:bg-[#061427] border border-sky-500/25 text-sky-300 hover:text-white text-xs font-bold font-['Montserrat'] tracking-wide flex items-center justify-center gap-2 transition-all shadow-sm"
                  >
                    {isCacSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Reading CAC Token…</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                        <span>{cacButtonText}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* ── 1-CLICK QUICK DEMO ACCESS SECTION (Only when VITE_DEMO_MODE=true) ── */}
              {import.meta.env.VITE_DEMO_MODE === 'true' && (
                <div className="mt-3.5 pt-2.5 border-t border-slate-700/50">
                  <div className="flex items-center justify-between mb-1.5 px-1">
                    <span className="text-[9.5px] uppercase font-mono text-[#8FA7BD]">
                      1-CLICK QUICK ACCESS FOR EVALUATION:
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleQuickLogin('normal_user')}
                      className="p-1.5 px-2.5 rounded-lg bg-[#040B15]/80 hover:bg-[#061427] border border-sky-500/20 hover:border-sky-400/50 text-[11px] font-mono text-left transition-all flex items-center justify-between group"
                    >
                      <span className="font-bold text-sky-400 group-hover:text-sky-300">
                        Normal User
                      </span>
                      <span className="text-[9.5px] text-slate-400 truncate">
                        Lt. Priya Singh
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickLogin('investigator')}
                      className="p-1.5 px-2.5 rounded-lg bg-[#040B15]/80 hover:bg-[#061427] border border-sky-500/20 hover:border-sky-400/50 text-[11px] font-mono text-left transition-all flex items-center justify-between group"
                    >
                      <span className="font-bold text-amber-400 group-hover:text-amber-300">
                        Investigator
                      </span>
                      <span className="text-[9.5px] text-slate-400 truncate">
                        Lt. Cdr. S. Rao
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* Classification Footer */}
              <div className="mt-3 pt-2 border-t border-slate-800/80 text-center">
                <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-[0.2em] font-mono">
                  {footerClassification}
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Footer Classification Banner */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="w-full flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] font-mono text-[#7FA0B8] border-t border-slate-800/80 pt-2.5"
        >
          <div className="flex items-center gap-2">
            <span className="text-white font-bold">{bottomBrandName}</span>
          </div>
          <div>
            RESTRICTED PROPRIETARY DEFENSE SYSTEM • UNAUTHORIZED ACCESS PROHIBITED UNDER OFFICIAL SECRETS ACT
          </div>
        </motion.footer>
      </div>
    </main>
  );
};
