import React from 'react';
import { useNavigate } from 'react-router-dom';
import { NavTracLoginPage } from '../components/NavTracLoginPage';
import { useAuth } from '../context/AuthContext';
import type { AuthCredentials, AuthResult, UserRole } from '../types';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, cacLogin } = useAuth();

  const handleAuthenticate = async (credentials: AuthCredentials): Promise<AuthResult> => {
    const result = await login(credentials);

    if (result.success) {
      if (result.role === 'normal_user') {
        navigate('/my/dashboard');
      } else {
        navigate('/command-center');
      }
    }

    return result;
  };

  const handleCacLogin = async (role: UserRole = 'normal_user') => {
    const result = await cacLogin(role);
    if (result.success) {
      if (result.role === 'normal_user') {
        navigate('/my/dashboard');
      } else {
        navigate('/command-center');
      }
    }
  };

  const handleForgotPassword = () => {
    alert('Security Notice: Automated password resets are restricted under Indian Navy EMCON protocol. Please contact your Command Information Warfare Officer (IWO).');
  };

  return (
    <NavTracLoginPage
      heroImageUrl="/Login_BG.png"
      onAuthenticate={handleAuthenticate}
      onCacLogin={handleCacLogin}
      onForgotPassword={handleForgotPassword}
    />
  );
};

export default LoginPage;
