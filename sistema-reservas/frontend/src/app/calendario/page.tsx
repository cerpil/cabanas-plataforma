'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { cabanasAPI, reservasAPI } from '@/services/api';
import { Loading } from '@/components/ui/Loading';
import { MapaOcupacao } from '@/components/MapaOcupacao';
import { Calendar as CalendarIcon, Filter, Plus } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { NovaReservaForm } from '@/components/NovaReservaForm';
import { ReservaDetalhesModal } from '@/components/ReservaDetalhesModal';

export default function CalendarioPage() {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedReservaId, setSelectedReservaId] = React.useState<number | null>(null);

  const { data: cabanas, isLoading: loadingCabanas } = useQuery({
    queryKey: ['cabanas'],
    queryFn: cabanasAPI.listar,
  });

  const { data: reservas, isLoading: loadingReservas } = useQuery({
    queryKey: ['reservas-calendario'],
    queryFn: () => reservasAPI.listar({ limit: 100 } as any),
  });

  if (loadingCabanas || loadingReservas) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100">Mapa de Ocupação</h2>
          <p className="text-sm text-stone-500 dark:text-stone-400">Visualização horizontal da disponibilidade das cabanas.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 px-4 py-2 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity"
          >
            <Plus size={18} />
            Nova Reserva
          </button>
        </div>
      </div>

      <MapaOcupacao 
        cabanas={cabanas || []} 
        reservas={reservas || []} 
        onReservaClick={(id) => setSelectedReservaId(id)}
      />

      {/* Modal Nova Reserva */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Nova Reserva"
      >
        <NovaReservaForm onSuccess={() => setIsModalOpen(false)} />
      </Modal>

      {/* Modal Detalhes da Reserva */}
      <ReservaDetalhesModal 
        reservaId={selectedReservaId} 
        isOpen={!!selectedReservaId}
        onClose={() => setSelectedReservaId(null)} 
      />
    </div>
  );
}