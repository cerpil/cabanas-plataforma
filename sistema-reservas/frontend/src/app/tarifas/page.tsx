'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cabanasAPI } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Loading } from '@/components/ui/Loading';
import { DollarSign, Calendar, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TarifasPage() {
  const queryClient = useQueryClient();
  const { data: cabanas, isLoading } = useQuery({
    queryKey: ['cabanas'],
    queryFn: cabanasAPI.listar,
  });

  const updatePrecosMutation = useMutation({
    mutationFn: ({ id, semana, fds }: { id: number; semana: number; fds: number }) => 
      cabanasAPI.atualizarPrecos(id, semana, fds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cabanas'] });
      toast.success('Preços atualizados com sucesso!');
    },
    onError: () => toast.error('Erro ao atualizar preços.'),
  });

  if (isLoading) return <Loading />;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100">Gestão Tarifária</h2>
        <p className="text-sm text-stone-500 dark:text-stone-400">Defina os valores das diárias para dias de semana e finais de semana.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {cabanas?.map((cabana) => (
          <TarifaCard 
            key={cabana.id} 
            cabana={cabana} 
            onSave={(semana, fds) => updatePrecosMutation.mutate({ id: cabana.id, semana, fds })}
            isLoading={updatePrecosMutation.isPending}
          />
        ))}
      </div>
    </div>
  );
}

function TarifaCard({ cabana, onSave, isLoading }: { cabana: any, onSave: (semana: number, fds: number) => void, isLoading: boolean }) {
  const [semana, setSemana] = useState(cabana.preco_base_semana);
  const [fds, setFds] = useState(cabana.preco_base_fds);

  return (
    <Card className="flex flex-col h-full">
      <div className="flex-1 space-y-6">
        <div className="flex items-center gap-3 border-b border-stone-100 dark:border-stone-800 pb-4">
          <div className="w-10 h-10 bg-stone-100 dark:bg-stone-800 rounded-xl flex items-center justify-center text-stone-600 dark:text-stone-400">
            <TrendingUp size={20} />
          </div>
          <div>
            <h3 className="font-bold text-stone-800 dark:text-stone-100">{cabana.nome}</h3>
            <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Cabana {cabana.numero}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-2">
              <Calendar size={14} /> Domingo a Quinta (Semana)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-sm">R$</span>
              <input 
                type="number" 
                value={semana} 
                onChange={(e) => setSemana(Number(e.target.value))}
                className="w-full pl-10 pr-4 py-3 bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-500 transition-all font-bold text-stone-800 dark:text-stone-100"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-2">
              <DollarSign size={14} className="text-green-600" /> Sexta e Sábado (FDS)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-sm">R$</span>
              <input 
                type="number" 
                value={fds} 
                onChange={(e) => setFds(Number(e.target.value))}
                className="w-full pl-10 pr-4 py-3 bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-500 transition-all font-bold text-stone-800 dark:text-stone-100"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <Button 
          onClick={() => onSave(semana, fds)} 
          isLoading={isLoading}
          className="w-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900"
        >
          Salvar Tarifas
        </Button>
      </div>
    </Card>
  );
}
