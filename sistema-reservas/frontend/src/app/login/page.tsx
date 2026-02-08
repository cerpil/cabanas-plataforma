'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { LayoutDashboard, Lock } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  username: z.string().min(1, 'Usuário é obrigatório'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      // O FastAPI espera form-data para o login OAuth2 padrão
      const formData = new FormData();
      formData.append('username', data.username);
      formData.append('password', data.password);

      const response = await axios.post('http://localhost:8000/api/auth/login', formData);
      
      login(response.data.access_token, response.data.user);
      toast.success('Bem-vindo ao sistema!');
    } catch (error: any) {
      toast.error('Usuário ou senha incorretos.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center mb-8">
            <img 
              src="/assets/branding/logo-transparent-dark.png" 
              alt="Logo Cabanas na Mata" 
              className="h-32 w-auto"
            />
          </div>
          <h1 className="text-3xl font-bold text-stone-800">Gestão de Reservas</h1>
          <p className="text-stone-500 mt-2">Painel de controle administrativo</p>
        </div>

        <Card className="p-8 shadow-2xl border-none">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input 
              label="Usuário"
              placeholder="Digite seu usuário"
              error={errors.username?.message}
              {...register('username')}
            />
            <Input 
              type="password"
              label="Senha"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />

            <Button type="submit" className="w-full h-12 text-lg" isLoading={isLoading}>
              <Lock size={18} className="mr-2" />
              Entrar no Sistema
            </Button>
          </form>
        </Card>

        <p className="text-center text-stone-400 text-sm">
          Acesso restrito a administradores autorizados.
        </p>
      </div>
    </div>
  );
}
