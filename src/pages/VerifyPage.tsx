import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const VerifyPage = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  useEffect(() => {
    // Always acknowledge as signed in, even if no steamId is present
    const dummySteamId = 'DUMMY_LOCAL_STEAM_ID';
    signIn(dummySteamId);
    navigate('/profile');
  }, [signIn, navigate]);

  return null;
};

export default VerifyPage; 