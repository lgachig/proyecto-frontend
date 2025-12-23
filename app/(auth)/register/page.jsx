'use client';
import { useForm } from '@tanstack/react-form';
import FormRegister from './FormRegister';


export default function RegisterPage() {
  const form = useForm({
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      terms: false,
    },
    onSubmit: async ({ value }) => {
      console.log('Form submitted:', value);
    },
  });

  return (
    <div className="w-[50%] p-10">
      <h1 className="text-[2.7vw] font-bold mb-8">Create Account</h1>

      <FormRegister form={form} />

      <div className="flex items-center gap-4 my-8 p-[2vw]">
        <div className="flex-1 h-px bg-gray-400" />
        <span className="text-[1.1vw] whitespace-nowrap">
          Already have an account? 
          <a href="/login" className="text-[#F28C28] font-semibold ml-2">Login</a>
        </span>
        <div className="flex-1 h-px bg-gray-400" />
      </div>
    </div>
  );
}