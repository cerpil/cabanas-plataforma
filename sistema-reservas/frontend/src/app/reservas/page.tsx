'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reservasAPI, cabanasAPI } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { ReservaDetalhesModal } from '@/components/ReservaDetalhesModal';
import { NovaReservaForm } from '@/components/NovaReservaForm';
import { Modal } from '@/components/ui/Modal';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Search, Plus, Home, Calendar, Filter, Eye, Download } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ReservasPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [cabanaFilter, setCabanaFilter] = useState<number | ''>('');
  const [selectedReservaId, setSelectedReservaId] = useState<number | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isNovaReservaOpen, setIsNovaReservaOpen] = useState(false);

  const { data: reservas, isLoading: loadingReservas } = useQuery({
    queryKey: ['reservas', statusFilter, cabanaFilter],
    queryFn: () => reservasAPI.listar({
      status: statusFilter || undefined,
      cabana_id: cabanaFilter || undefined
    }),
  });

  const { data: cabanas } = useQuery({
    queryKey: ['cabanas'],
    queryFn: cabanasAPI.listar,
  });

  const handleExport = async () => {
    try {
      const data = await reservasAPI.exportar();
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'reservas_cabanas.csv');
      document.body.appendChild(link);
      link.click();
      toast.success('Arquivo gerado com sucesso!');
    } catch (error) {
      toast.error('Erro ao exportar dados.');
    }
  };

  const filteredReservas = reservas?.filter(r => 
    r.cliente?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.id.toString().includes(searchTerm)
  );

  if (loadingReservas) return <Loading />;

  return (
    <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100">Reservas</h2>
                <p className="text-stone-500 dark:text-stone-400">Lista completa de todas as estadias agendadas.</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleExport} variant="outline" className="gap-2 dark:border-stone-700 dark:text-stone-300">
                  <Download size={18} />
                  Exportar CSV
                </Button>
                <Button onClick={() => setIsNovaReservaOpen(true)} className="gap-2 bg-green-600 hover:bg-green-700">
                  <Plus size={18} />
                  Nova Reserva
                </Button>
              </div>
            </div>
      
            <Card>
              <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                  <input
                    type="text"
                    placeholder="Buscar por cliente ou ID..."
                    className="w-full pl-10 pr-4 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-500 transition-all text-sm dark:text-stone-200"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="flex gap-2">
                  <select 
                    className="px-4 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-500 dark:text-stone-200"
                    value={cabanaFilter}
                    onChange={(e) => setCabanaFilter(e.target.value ? Number(e.target.value) : '')}
                  >
                    <option value="">Todas as Cabanas</option>
                    {cabanas?.map(c => (
                      <option key={c.id} value={c.id}>Cabana {c.numero}</option>
                    ))}
                  </select>
      
                  <select 
                    className="px-4 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-500 dark:text-stone-200"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">Todos os Status</option>
                    <option value="confirmada">Confirmada</option>
                    <option value="pendente">Pendente</option>
                    <option value="cancelada">Cancelada</option>
                    <option value="concluída">Concluída</option>
                  </select>
                </div>
              </div>
      
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-stone-100 dark:border-stone-800 text-stone-400 dark:text-stone-500 text-xs font-black uppercase tracking-widest">
                      <th className="py-4 px-4">Hóspede / Cabana</th>
                      <th className="py-4 px-4">Datas</th>
                      <th className="py-4 px-4">Valor</th>
                      <th className="py-4 px-4">Status</th>
                      <th className="py-4 px-4 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {filteredReservas && filteredReservas.length > 0 ? (
                      filteredReservas.map((reserva) => (
                        <tr key={reserva.id} className="border-b border-stone-50 dark:border-stone-800/50 hover:bg-stone-50/50 dark:hover:bg-stone-800/50 transition-colors">
                          <td className="py-4 px-4">
                            <div>
                              <p className="font-bold text-stone-800 dark:text-white">{reserva.cliente?.nome}</p>
                              <p className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1">
                                <Home size={10} /> Cabana {reserva.cabana?.numero}
                              </p>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-stone-600 dark:text-stone-300 flex items-center gap-2">
                              <Calendar size={14} className="text-stone-400" />
                              <span>
                                {format(parseISO(reserva.data_checkin), 'dd/MM/yy')} — {format(parseISO(reserva.data_checkout), 'dd/MM/yy')}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4 font-medium text-stone-700 dark:text-stone-200">
                            R$ {reserva.valor_total?.toLocaleString('pt-BR')}
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              reserva.status === 'confirmada' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                              reserva.status === 'pendente' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            }`}>
                              {reserva.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <button 
                              onClick={() => { setSelectedReservaId(reserva.id); setIsDetailsOpen(true); }}
                              className="p-2 hover:bg-stone-200 dark:hover:bg-stone-800 rounded-lg text-stone-600 dark:text-stone-400 transition-colors"
                            >
                              <Eye size={18} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-stone-400 dark:text-stone-600 italic">
                          Nenhuma reserva encontrada.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

      <ReservaDetalhesModal 
        reservaId={selectedReservaId} 
        isOpen={isDetailsOpen} 
        onClose={() => setIsDetailsOpen(false)} 
      />

      <Modal 
        isOpen={isNovaReservaOpen} 
        onClose={() => setIsNovaReservaOpen(false)} 
        title="Nova Reserva"
      >
        <NovaReservaForm onSuccess={() => setIsNovaReservaOpen(false)} />
      </Modal>
    </div>
  );
}
