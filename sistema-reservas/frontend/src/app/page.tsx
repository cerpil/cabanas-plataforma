'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { cabanasAPI, reservasAPI } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Loading } from '@/components/ui/Loading';
import { 
  CheckCircle2, 
  Clock, 
  Users, 
  TrendingUp, 
  Calendar as CalendarIcon 
} from 'lucide-react';

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: cabanasAPI.stats,
  });

  const { data: reservas, isLoading: reservasLoading } = useQuery({
    queryKey: ['reservas-recentes'],
    queryFn: () => reservasAPI.listar({ limit: 5 } as any),
  });

  if (statsLoading || reservasLoading) return <Loading />;

  const statCards = [
    { 
      label: 'Reservas', 
      value: stats?.total_reservas || 0, 
      icon: TrendingUp, 
      color: 'text-blue-600 dark:text-blue-400', 
      bg: 'bg-blue-50 dark:bg-blue-900/20' 
    },
    { 
      label: 'Confirmadas', 
      value: stats?.confirmadas || 0, 
      icon: CheckCircle2, 
      color: 'text-green-600 dark:text-green-400', 
      bg: 'bg-green-50 dark:bg-green-900/20' 
    },
    { 
      label: 'Pendentes', 
      value: stats?.pendentes || 0, 
      icon: Clock, 
      color: 'text-amber-600 dark:text-amber-400', 
      bg: 'bg-amber-50 dark:bg-amber-900/20' 
    },
    { 
      label: 'Clientes', 
      value: stats?.total_clientes || 0, 
      icon: Users, 
      color: 'text-purple-600 dark:text-purple-400', 
      bg: 'bg-purple-50 dark:bg-purple-900/20' 
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100">Painel de Gestão</h2>
        <p className="text-sm text-stone-500 dark:text-stone-400">Resumo operacional das Cabanas.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="hover:shadow-md transition-all duration-300 p-4">
            <div className="flex flex-col gap-2">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center shrink-0`}>
                <stat.icon size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-stone-400 dark:text-stone-500">{stat.label}</p>
                <p className="text-2xl font-bold text-stone-800 dark:text-white leading-tight">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Próximas Reservas */}
        <div className="lg:col-span-2">
          <Card title="Próximas Reservas">
            <div className="space-y-4">
              {reservas && reservas.length > 0 ? (
                reservas.map((reserva) => (
                  <div key={reserva.id} className="flex items-center justify-between p-4 rounded-lg border border-stone-100 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center text-stone-600 dark:text-stone-400">
                        <CalendarIcon size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-stone-800 dark:text-white">{reserva.cliente?.nome}</p>
                        <p className="text-xs text-stone-500 dark:text-stone-300">
                          {reserva.cabana?.nome} • {reserva.data_checkin.split('-').reverse().join('/')} até {reserva.data_checkout.split('-').reverse().join('/')}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      reserva.status === 'confirmada' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                      reserva.status === 'pendente' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {reserva.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-stone-400">
                  <CalendarIcon size={48} className="mx-auto mb-4 opacity-20" />
                  <p>Nenhuma reserva encontrada para os próximos dias.</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Quick Actions / Info */}
        <div className="space-y-6">
          <Card title="Acesso Rápido">
            <div className="grid grid-cols-1 gap-3">
              <button className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                <CalendarIcon size={18} />
                Nova Reserva
              </button>
              <button className="w-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 py-3 rounded-lg font-bold hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors">
                Cadastrar Cliente
              </button>
            </div>
          </Card>

          <Card title="Status das Cabanas">
            <div className="space-y-4">
              {stats?.cabanas_status?.map((cabana: any) => (
                <div key={cabana.id} className="flex items-center justify-between text-sm">
                  <span className="font-medium text-stone-600 dark:text-stone-400">
                    {cabana.nome}
                  </span>
                  <span className="flex items-center gap-2 dark:text-stone-300">
                    <div className={`w-2 h-2 rounded-full ${cabana.status === 'Livre' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    {cabana.status}
                  </span>
                </div>
              ))}
              {!stats?.cabanas_status && <p className="text-xs text-stone-400">Carregando status...</p>}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}