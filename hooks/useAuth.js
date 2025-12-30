'use client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../lib/api'; 
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data) => apiService.login(data),
    onSuccess: (data) => {
      queryClient.setQueryData(['user'], data.user);
      queryClient.invalidateQueries(['role'], data.role);
      queryClient.invalidateQueries(['price_role'], data.price_role);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('userUpdated'));
      }
      router.push('/dashboard', );
    },
    onError: (error) => {
      console.error('Login error:',  error.message);
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data) => apiService.register(data),
    onSuccess: (data) => {
      queryClient.setQueryData(['user'], data.user);
      queryClient.invalidateQueries(['role'], data.role);
      queryClient.invalidateQueries(['price_role'], data.price_role);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('userUpdated'));
      }
      router.push('/dashboard');
    },
    onError: (error) => {
      console.error('Register error:',  error.message);
    },
  });
  
}

export function useCurrentUser() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const loadUser = () => {
      const userStr = localStorage.getItem('user');
      try {
        const parsedUser = userStr ? JSON.parse(userStr) : null;
        setUser(parsedUser);
      } catch (e) {
        setUser(null);
      }
    };

    loadUser();
    
    const handleStorageChange = (e) => {
      if (e.key === 'user') {
        loadUser();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    const handleUserUpdate = () => {
      loadUser();
    };
    
    window.addEventListener('userUpdated', handleUserUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userUpdated', handleUserUpdate);
    };
  }, []);

  return user;
}
