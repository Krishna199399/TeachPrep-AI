import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { AppProvider } from '@/context/AppContext';
import { AuthProvider } from '@/context/AuthContext';
import NotificationContainer from '@/components/NotificationContainer';
import { useEffect } from 'react';
import { applyTheme } from '@/utils/themeUtils';

export default function App({ Component, pageProps }: AppProps) {
  // Apply theme on initial client-side load
  useEffect(() => {
    applyTheme();
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      applyTheme(); // This will reapply theme based on preferences
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  return (
    <AuthProvider>
      <AppProvider>
        <main className="font-sans">
          <Component {...pageProps} />
          <NotificationContainer />
        </main>
      </AppProvider>
    </AuthProvider>
  );
} 