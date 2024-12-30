import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Correo electrónico no válido!"),
});

export type LoginFormDataValues = z.infer<typeof loginSchema>;

export const useLoginForm = () =>
  useForm<LoginFormDataValues>({
    resolver: zodResolver(loginSchema),
  });
