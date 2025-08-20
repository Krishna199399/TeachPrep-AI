import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import Head from 'next/head';

export default function Logout() {
  const { logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Execute logout
    logout();
    
    // Redirect to login page after logout
    const redirectTimer = setTimeout(() => {
      router.push('/login');
    }, 300);

    return () => clearTimeout(redirectTimer);
  }, [logout, router]);

  return (
    <>
      <Head>
        <title>Logging Out | TeachPrep AI</title>
        <meta name="description" content="Logging out of your TeachPrep AI account" />
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-medium text-gray-900">Logging out...</h2>
          <p className="mt-2 text-sm text-gray-500">You are being signed out of TeachPrep AI</p>
        </div>
      </div>
    </>
  );
} 