'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

const clienteSchema = z.object({
  nome: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
  telefone: z.string().min(10, 'Telefone inválido'),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
});

type ClienteFormData = z.infer<typeof clienteSchema>;

interface ClienteFormProps {
  initialData?: Partial<ClienteFormData>;
  onSubmit: (data: ClienteFormData) => void;
  isLoading?: boolean;
}

export const ClienteForm: React.FC<ClienteFormProps> = ({ initialData, onSubmit, isLoading }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<ClienteFormData>({
    resolver: zodResolver(clienteSchema),
    defaultValues: initialData || {
      nome: '',
      telefone: '',
      email: '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Nome Completo"
        placeholder="Ex: João Silva"
        error={errors.nome?.message}
        {...register('nome')}
        className="dark:bg-stone-800 dark:border-stone-700 dark:text-stone-100"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Telefone / WhatsApp"
          placeholder="(31) 99999-9999"
          error={errors.telefone?.message}
          {...register('telefone')}
          className="dark:bg-stone-800 dark:border-stone-700 dark:text-stone-100"
        />
        <Input
          label="E-mail (Opcional)"
          placeholder="joao@email.com"
          error={errors.email?.message}
          {...register('email')}
          className="dark:bg-stone-800 dark:border-stone-700 dark:text-stone-100"
        />
      </div>
      <div className="pt-4">
        <Button type="submit" className="w-full" isLoading={isLoading}>
          Salvar Cliente
        </Button>
      </div>
    </form>
  );
};
