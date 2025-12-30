'use client';
import { useForm } from '@tanstack/react-form';
import FormRegister from './FormRegister';
import { useState } from 'react';
import { useRegister } from '../../../hooks/useAuth';

export default function RegisterPage() {
  const registerMutation = useRegister();
  const [roleId, setRoleId] = useState('r001');

  const form = useForm({
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      institutionalId: '',
      terms: false,
    },
    onSubmit: async ({ value }) => {
      if (!value.terms) {
        alert('You must accept the terms and conditions');
        return;
      }

      try {
        await registerMutation.mutateAsync({
          full_name: value.fullName,
          email: value.email,
          password: value.password,
          institutional_id: value.institutionalId || `UCE-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
          role_id: roleId,
        });
      } catch (error) {
        const errorMessage = error?.response?.data?.message || error?.message || 'Registration failed';
        alert(errorMessage);
      }
    },
  });

  return (
    <div className="w-[50%] p-10">
      <h1 className="text-[2.7vw] font-bold mb-8">Create Account</h1>

      <FormRegister 
        form={form} 
        roleId={roleId}
        setRoleId={setRoleId}
      />
    </div>

  );
}
