import React from 'react';
import { useAuth } from '../hooks/useAuth';

const SignInButton = () => {
  // No local sign-in logic here
  const handleSignIn = () => {
    const steamLoginUrl = `https://steamcommunity.com/openid/login?${new URLSearchParams({
      'openid.ns': 'http://specs.openid.net/auth/2.0',
      'openid.mode': 'checkid_setup',
      'openid.return_to': `${window.location.origin}/verify`,
      'openid.realm': window.location.origin,
      'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
      'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select',
    })}`;
    window.location.href = steamLoginUrl;
  };

  return (
    <button onClick={handleSignIn} className="btn-primary">
      Sign in with Steam
    </button>
  );
};

export default SignInButton; 