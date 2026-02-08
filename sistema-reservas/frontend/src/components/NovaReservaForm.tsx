'use client';

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cabanasAPI, clientesAPI, reservasAPI } from '@/services/api';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Loading } from './ui/Loading';
import { AlertCircle, UserPlus, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { DateRangePicker } from './ui/DateRangePicker';
import { Modal } from './ui/Modal';
import { ClienteForm } from './ClienteForm';

const reservaSchema = z.object({
  cliente_id: z.number({ required_error: 'Selecione um cliente' }),  cabana_id: z.number({ required_error: 'Selecione uma cabana' }),
  data_checkin: z.string().min(1, 'Data de entrada é obrigatória'),
  data_checkout: z.string().min(1, 'Data de saída é obrigatória'),
  forma_pagamento: z.string().min(1, 'Selecione a forma de pagamento'),
  valor_total: z.coerce.number().min(0, 'O valor não pode ser negativo'),
  valor_sinal: z.coerce.number().min(0, 'O sinal não pode ser negativo'),
  observacoes: z.string().optional(),
});

type ReservaFormData = z.infer<typeof reservaSchema>;

interface NovaReservaFormProps {
  onSuccess: () => void;
  initialDate?: string;
}

export const NovaReservaForm: React.FC<NovaReservaFormProps> = ({ onSuccess, initialDate }) => {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [isNewClienteModalOpen, setIsNewClienteModalOpen] = useState(false);

  // Busca Clientes e Cabanas para os Selects
  const { data: clientes, isLoading: loadingClientes } = useQuery({
    queryKey: ['clientes'],
    queryFn: clientesAPI.listar,
  });

  const { data: cabanas, isLoading: loadingCabanas } = useQuery({
    queryKey: ['cabanas'],
    queryFn: cabanasAPI.listar,
  });

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<ReservaFormData>({
    resolver: zodResolver(reservaSchema),
    defaultValues: {
      data_checkin: initialDate || '',
      status: 'pendente',
    },
  });

  const createClienteMutation = useMutation({
    mutationFn: (data: any) => clientesAPI.criar(data),
    onSuccess: (newCliente) => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      setValue('cliente_id', newCliente.id);
      setIsNewClienteModalOpen(false);
      toast.success('Cliente cadastrado e selecionado!');
    },
    onError: () => toast.error('Erro ao cadastrar cliente'),
  });

  // Observar mudanças para cálculo de preço
  const watchCabana = watch('cabana_id');
  const watchCheckin = watch('data_checkin');
  const watchCheckout = watch('data_checkout');

  useEffect(() => {
    const fetchPrice = async () => {
      if (watchCabana && watchCheckin && watchCheckout) {
        try {
          const data = await reservasAPI.calcularPreco({
            cabana_id: watchCabana,
            data_checkin: watchCheckin,
            data_checkout: watchCheckout
          });
          if (data.total > 0) {
            setValue('valor_total', data.total);
          }
        } catch (err) {
          console.error('Erro ao calcular preço sugerido');
        }
      }
    };
    fetchPrice();
  }, [watchCabana, watchCheckin, watchCheckout, setValue]);

  const createReservaMutation = useMutation({
    mutationFn: (data: ReservaFormData) => reservasAPI.criar(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservas-calendario'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      toast.success('Reserva criada com sucesso!');
      onSuccess();
    },
    onError: (err: any) => {
      const msg = err.response?.data?.detail || 'Erro ao criar reserva.';
      setError(msg);
      toast.error(msg);
    },
  });

  const onSubmit = (data: ReservaFormData) => {
    setError(null);
    createReservaMutation.mutate(data);
  };

  if (loadingClientes || loadingCabanas) return <Loading />;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-700 text-sm">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Seleção de Cliente */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-stone-700 dark:text-stone-300">Cliente</label>
        <div className="flex gap-2">
          <select 
            {...register('cliente_id', { valueAsNumber: true })}
            className="flex-1 px-4 py-2 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-500 transition-all text-sm text-stone-800 dark:text-stone-100"
          >
            <option value="">Selecione um cliente...</option>
            {clientes?.map(c => (
              <option key={c.id} value={c.id} className="dark:bg-stone-800">{c.nome} ({c.telefone})</option>
            ))}
          </select>
          <Button 
            type="button" 
            variant="outline" 
            className="px-3 dark:border-stone-700 dark:text-stone-300"
            onClick={() => setIsNewClienteModalOpen(true)}
          >
            <UserPlus size={18} />
          </Button>
        </div>
        {errors.cliente_id && <span className="text-xs text-red-500">{errors.cliente_id.message}</span>}
      </div>

      {/* Seleção de Cabana */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-stone-700 dark:text-stone-300">Cabana</label>
        <select 
          {...register('cabana_id', { valueAsNumber: true })}
          className="w-full px-4 py-2 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-500 transition-all text-sm text-stone-800 dark:text-stone-100"
        >
          <option value="">Selecione a cabana...</option>
          {cabanas?.map(c => (
            <option key={c.id} value={c.id} className="dark:bg-stone-800">{c.nome}</option>
          ))}
        </select>
        {errors.cabana_id && <span className="text-xs text-red-500">{errors.cabana_id.message}</span>}
      </div>

      {/* Datas com Range Picker */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-stone-700 dark:text-stone-300">Período da Reserva</label>
        <DateRangePicker 
          initialRange={{ 
            from: watchCheckin, 
            to: watchCheckout 
          }}
          onRangeSelect={(range) => {
            setValue('data_checkin', range.from);
            setValue('data_checkout', range.to);
          }}
        />
        {(errors.data_checkin || errors.data_checkout) && (
          <span className="text-xs text-red-500">Selecione as datas de check-in e check-out</span>
        )}
      </div>

      {/* Pagamento e Valor */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-stone-700 dark:text-stone-300">Pagamento</label>
          <select 
            {...register('forma_pagamento')}
            className="w-full px-4 py-2 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-500 transition-all text-sm text-stone-800 dark:text-stone-100"
          >
            <option value="">Forma...</option>
            <option value="Pix">Pix</option>
            <option value="Cartão">Cartão</option>
            <option value="Dinheiro">Dinheiro</option>
            <option value="Transferência">Transferência</option>
          </select>
          {errors.forma_pagamento && <span className="text-xs text-red-500">{errors.forma_pagamento.message}</span>}
        </div>
        <Input 
          type="number" 
          step="0.01" 
          label="Valor Total" 
          placeholder="0,00"
          error={errors.valor_total?.message}
          {...register('valor_total')}
          className="dark:bg-stone-800 dark:border-stone-700 dark:text-stone-100"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-stone-700 dark:text-stone-300">Observações (Opcional)</label>
        <textarea 
          {...register('observacoes')}
          rows={3}
          className="w-full px-4 py-2 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-500 transition-all text-sm text-stone-800 dark:text-stone-100 placeholder-stone-400"
          placeholder="Notas extras sobre a reserva..."
        />
      </div>

      <div className="pt-4 flex gap-3">
        <Button 
          type="submit" 
          className="flex-1 bg-green-600 hover:bg-green-700" 
          isLoading={createReservaMutation.isPending}
        >
          Confirmar Reserva
        </Button>
      </div>

      <Modal
        isOpen={isNewClienteModalOpen}
        onClose={() => setIsNewClienteModalOpen(false)}
        title="Cadastrar Novo Cliente"
      >
        <ClienteForm 
          onSubmit={(data) => createClienteMutation.mutate(data)} 
          isLoading={createClienteMutation.isPending}
        />
      </Modal>
    </form>
  );
};
