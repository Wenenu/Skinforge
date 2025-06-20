import React from 'react';

const SignInButton = () => {
  const handleSignIn = () => {
    // Redirect to our backend which will handle Steam OpenID authentication
    const backendAuthUrl = 'http://localhost:3002/auth/steam';
    window.location.href = backendAuthUrl;
  };

  return (
    <button onClick={handleSignIn} className="btn-primary">
      Sign in with Steam
    </button>
  );
};

export default SignInButton; 