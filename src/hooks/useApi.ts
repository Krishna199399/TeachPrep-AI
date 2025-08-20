import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

interface ApiOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
}

interface ApiResponse<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useApi<T = any>(url: string, options: Partial<ApiOptions> = {}): ApiResponse<T> {
  const { token } = useAuth();
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Function to make the API request
  const fetchData = async (): Promise<void> => {
    if (!token) {
      setError('Authentication token is missing');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const fetchOptions: RequestInit = {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...options.headers,
        },
        ...(options.body ? { body: JSON.stringify(options.body) } : {}),
      };

      const response = await fetch(url, fetchOptions);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || `API error: ${response.status}`);
      }

      const responseData = await response.json();
      setData(responseData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching data');
      console.error('API request error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch when component mounts
  const refetch = async (): Promise<void> => {
    await fetchData();
  };

  return { data, isLoading, error, refetch };
}

export function useLazyApi<T = any>(url: string, options: Partial<ApiOptions> = {}): [
  (body?: any) => Promise<{ data: T | null; error: string | null }>,
  { isLoading: boolean }
] {
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Function to make the API request when triggered
  const executeRequest = async (body?: any): Promise<{ data: T | null; error: string | null }> => {
    if (!token) {
      return { data: null, error: 'Authentication token is missing' };
    }

    setIsLoading(true);
    
    try {
      const fetchOptions: RequestInit = {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...options.headers,
        },
        ...(body || options.body ? { body: JSON.stringify(body || options.body) } : {}),
      };

      const response = await fetch(url, fetchOptions);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || `API error: ${response.status}`);
      }

      const responseData = await response.json();
      return { data: responseData, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching data';
      console.error('API request error:', err);
      return { data: null, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return [executeRequest, { isLoading }];
} 