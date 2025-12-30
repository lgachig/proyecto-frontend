'use client';
import { useForm } from '@tanstack/react-form';
import FormLogin from './Formlogin';
import {useLogin} from '../../../hooks/useAuth';

export default function LoginPage() {
  const loginMutation = useLogin();
  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      try {
        await loginMutation.mutateAsync({
          email: value.email,
          password: value.password,
        });
      } catch (error) {
        const errorMessage = error?.response?.data?.message || error?.message || 'Login failed';
        alert(errorMessage);
      }
    },
  });

  return (
    <div className="w-[50%] p-10">
      <h1 className="text-[2.7vw] font-bold mb-8">Login</h1>

      <FormLogin form={form}></FormLogin>
      
      <div className="flex items-center gap-4 my-8 p-[2vw]">
        <div className="flex-1 h-[1px] bg-gray-300" />
        <span className="text-[1.1vw] whitespace-nowrap">
          Don't you have an account? 
          <a href="/register" className="text-[#F28C28] font-semibold ml-2">Register</a>
        </span>
        <div className="flex-1 h-[1px] bg-gray-300" />
      </div>

      <div className="flex justify-between gap-4 w-full px-[2vw]">
        {['google.svg', 'meta.svg', 'apple.svg'].map((icon) => (
          <button
            key={icon}
            className="flex-1 h-[4.5vw] flex items-center justify-center bg-[#F7F7F7] border border-[#ADADAD] rounded-[10px] shadow-sm hover:shadow-md transition"
          >
            <img src={`/${icon}`} alt={icon} className="h-[1.5vw]" />
          </button>
        ))}
      </div>
    </div>
  );
}