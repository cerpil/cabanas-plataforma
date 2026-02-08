'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { reservasAPI, cabanasAPI } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Loading } from '@/components/ui/Loading';
import { 
  BarChart3, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Home
} from 'lucide-react';

const mesesNomes = [
  '', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export default function RelatoriosPage() {
  const { data: relatorios, isLoading: loadingRelatorios } = useQuery({
    queryKey: ['relatorios'],
    queryFn: reservasAPI.relatorios,
  });

  const { data: cabanas } = useQuery({
    queryKey: ['cabanas'],
    queryFn: cabanasAPI.listar,
  });

  if (loadingRelatorios) return <Loading />;

  const faturamentoTotal = relatorios?.mensal.reduce((acc: number, curr: any) => acc + curr.total, 0) || 0;
  const totalReservas = relatorios?.por_cabana.reduce((acc: number, curr: any) => acc + curr.reservas, 0) || 0;
  const ticketMedio = totalReservas > 0 ? faturamentoTotal / totalReservas : 0;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100">Relatórios Financeiros</h2>
        <p className="text-stone-500 dark:text-stone-400">Análise de desempenho e faturamento das cabanas.</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-stone-900 dark:bg-stone-900/50 text-white border-none shadow-xl">
          <p className="text-stone-400 text-sm font-medium">Faturamento Total (Confirmado)</p>
          <p className="text-3xl font-bold mt-2 text-green-400">R$ {faturamentoTotal.toLocaleString('pt-BR')}</p>
        </Card>
        <Card>
          <p className="text-stone-500 dark:text-stone-400 text-sm font-medium">Ticket Médio por Reserva</p>
          <p className="text-3xl font-bold mt-2 text-stone-800 dark:text-stone-100">R$ {ticketMedio.toLocaleString('pt-BR')}</p>
        </Card>
        <Card>
          <p className="text-stone-500 dark:text-stone-400 text-sm font-medium">Total de Estadias</p>
          <p className="text-3xl font-bold mt-2 text-stone-800 dark:text-stone-100">{totalReservas} reservas</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Faturamento por Mês */}
        <Card title="Faturamento por Mês" className="flex flex-col">
          <div className="space-y-4 mt-2">
            {relatorios?.mensal && relatorios.mensal.length > 0 ? (
              relatorios.mensal.map((item: any, idx: number) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-bold text-stone-700 dark:text-stone-300">{mesesNomes[item.mes]} {item.ano}</span>
                    <span className="text-stone-500 dark:text-stone-400 font-medium">R$ {item.total.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="w-full bg-stone-100 dark:bg-stone-800 h-3 rounded-full overflow-hidden">
                    <div 
                      className="bg-green-600 dark:bg-green-500 h-full rounded-full transition-all duration-1000"
                      style={{ width: `${(item.total / (Math.max(...relatorios.mensal.map((m: any) => m.total)) || 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center py-12 text-stone-400 italic">Dados insuficientes para gerar o gráfico.</p>
            )}
          </div>
        </Card>

        {/* Desempenho por Cabana */}
        <Card title="Desempenho por Unidade">
          <div className="space-y-6">
            {cabanas?.map((cabana) => {
              const stats = relatorios?.por_cabana.find((o: any) => o.cabana_id === cabana.id) || { reservas: 0, faturamento: 0 };
              return (
                <div key={cabana.id} className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-700 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white dark:bg-stone-800 rounded-lg flex items-center justify-center border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300">
                      <Home size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-stone-800 dark:text-stone-100">{cabana.nome}</p>
                      <p className="text-xs text-stone-500 dark:text-stone-400">{stats.reservas} reservas realizadas</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-stone-800 dark:text-white">R$ {stats.faturamento.toLocaleString('pt-BR')}</p>
                    <p className="text-[10px] text-stone-400 dark:text-stone-500 uppercase font-black">Total Acumulado</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Insights */}
      <Card title="Insights do Negócio" className="bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-900/30">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex gap-4">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg h-fit text-green-700 dark:text-green-400">
              <TrendingUp size={20} />
            </div>
            <div>
              <h4 className="font-bold text-green-800 dark:text-green-100">Sazonalidade</h4>
              <p className="text-sm text-green-700 dark:text-green-300/80">As reservas tendem a se concentrar nos fins de semana. Considere uma estratégia de "Preços Dinâmicos" para atrair nômades digitais durante a semana.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg h-fit text-green-700 dark:text-green-400">
              <BarChart3 size={20} />
            </div>
            <div>
              <h4 className="font-bold text-green-800 dark:text-green-100">Mix de Receita</h4>
              <p className="text-sm text-green-700 dark:text-green-300/80">A Cabana com Ofurô (02) representa a maior parte do faturamento. Avalie replicar esse diferencial nas outras unidades para aumentar o ticket médio geral.</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
