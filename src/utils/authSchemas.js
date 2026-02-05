import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El correo es obligatorio")
    .email("Correo inválido")
    .regex(/@uce\.edu\.ec$/, "Debes usar tu correo institucional (@uce.edu.ec)"),
  password: z
    .string()
    .min(1, "La contraseña es obligatoria"),
});

export const registerSchema = z.object({
  fullName: z
    .string()
    .min(3, "El nombre debe tener al menos 3 letras")
    .regex(/^[a-zA-ZÁ-ÿ\s]+$/, "Solo se permiten letras y espacios"),
  email: z
    .string()
    .min(1, "El correo es obligatorio")
    .email("Formato de correo inválido")
    .regex(/@uce\.edu\.ec$/, "Exclusivo para estudiantes UCE (@uce.edu.ec)"),
  password: z
    .string()
    .min(6, "La contraseña debe tener mínimo 6 caracteres"),
  confirmPassword: z
    .string()
    .min(1, "Debes confirmar tu contraseña"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});