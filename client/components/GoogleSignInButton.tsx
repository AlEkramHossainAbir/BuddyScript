'use client';

import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import Image from 'next/image';
import { toast } from 'react-toastify';

export default function GoogleSignInButton({btnText}: {btnText?: string}) {
  const { googleLogin } = useAuth();
  const [loading, setLoading] = useState(false);

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        // Send access_token to backend for validation
        // Backend will extract user info and create/login user
        await googleLogin(tokenResponse.access_token);
      } catch {
        toast.error('Google login failed. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      toast.error('Google sign-in was cancelled or failed.');
    },
  });

  return (
    <button
      type="button"
      onClick={() => login()}
      disabled={loading}
      className="_social_login_content_btn _mar_b40"
      style={{
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.6 : 1,
      }}
    >
      <Image src="/assets/images/google.svg" alt="Google" className="_google_img" width={24} height={24} />
      <span> {loading ? 'Signing in...' : btnText}</span>
     
    </button>
  );
}
