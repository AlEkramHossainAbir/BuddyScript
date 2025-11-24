'use client';

import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

export default function GoogleSignInButton() {
  const { googleLogin } = useAuth();
  const [loading, setLoading] = useState(false);

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        // Get user info from Google
        const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        });
        await response.json();
        
        // Use access token as ID token for backend verification
        const idToken = tokenResponse.access_token;
        
        await googleLogin(idToken);
      } catch (error) {
        console.error('Google login error:', error);
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      console.error('Google login failed');
    },
  });

  return (
    <button
      type="button"
      onClick={() => login()}
      disabled={loading}
      className="_social_login_form_input _align_center _cursor_point _mar_b14"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        border: '1px solid #dadce0',
        backgroundColor: 'white',
        color: '#3c4043',
        fontWeight: '500',
        padding: '10px 16px',
        borderRadius: '4px',
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.6 : 1,
      }}
    >
      <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg">
        <g fill="none" fillRule="evenodd">
          <path
            d="M17.6 9.2l-.1-1.8H9v3.4h4.8C13.6 12 13 13 12 13.6v2.2h3a8.8 8.8 0 0 0 2.6-6.6z"
            fill="#4285F4"
            fillRule="nonzero"
          />
          <path
            d="M9 18c2.4 0 4.5-.8 6-2.2l-3-2.2a5.4 5.4 0 0 1-8-2.9H1V13a9 9 0 0 0 8 5z"
            fill="#34A853"
            fillRule="nonzero"
          />
          <path d="M4 10.7a5.4 5.4 0 0 1 0-3.4V5H1a9 9 0 0 0 0 8l3-2.3z" fill="#FBBC05" fillRule="nonzero" />
          <path
            d="M9 3.6c1.3 0 2.5.4 3.4 1.3L15 2.3A9 9 0 0 0 1 5l3 2.4a5.4 5.4 0 0 1 5-3.7z"
            fill="#EA4335"
            fillRule="nonzero"
          />
        </g>
      </svg>
      {loading ? 'Signing in...' : 'Sign in with Google'}
    </button>
  );
}
