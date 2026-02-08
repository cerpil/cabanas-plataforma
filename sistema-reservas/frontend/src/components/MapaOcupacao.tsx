'use client';

import React, { useMemo } from 'react';
import { 
  format, 
  addDays, 
  startOfToday, 
  eachDayOfInterval, 
  isSameDay, 
  isWithinInterval,
  startOfDay
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Reserva, Cabana } from '../types';

interface MapaOcupacaoProps {
  reservas: Reserva[];
  cabanas: Cabana[];
  onReservaClick?: (reservaId: number) => void;
}

export const MapaOcupacao: React.FC<MapaOcupacaoProps> = ({ reservas, cabanas, onReservaClick }) => {
  const [startDate, setStartDate] = React.useState(startOfToday());
  const diasParaExibir = 21; // Exibir 3 semanas de uma vez

  const dias = useMemo(() => {
    return eachDayOfInterval({
      start: startDate,
      end: addDays(startDate, diasParaExibir - 1),
    });
  }, [startDate]);

  const navegar = (quantidade: number) => {
    setStartDate(addDays(startDate, quantidade));
  };

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden">
      {/* Header do Mapa */}
      <div className="p-4 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between bg-stone-50/50 dark:bg-stone-800/50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400">
            <CalendarIcon size={20} />
            <span className="font-bold text-stone-800 dark:text-white">
              {format(startDate, "MMMM yyyy", { locale: ptBR })}
            </span>
          </div>
          <button 
            onClick={() => setStartDate(startOfToday())}
            className="text-xs font-bold uppercase tracking-widest px-3 py-1 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-full hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
          >
            Hoje
          </button>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navegar(-7)} className="p-2 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-full transition-colors">
            <ChevronLeft size={20} />
          </button>
          <button onClick={() => navegar(7)} className="p-2 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-full transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="sticky left-0 z-20 bg-stone-50 dark:bg-stone-900 p-4 text-left border-r border-b border-stone-200 dark:border-stone-800 min-w-[200px]">
                <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Cabana</span>
              </th>
              {dias.map((dia) => (
                <th 
                  key={dia.toISOString()} 
                  className={`p-2 border-b border-r border-stone-100 dark:border-stone-800 min-w-[60px] ${
                    isSameDay(dia, startOfToday()) ? 'bg-amber-50 dark:bg-amber-900/20' : ''
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] uppercase font-bold text-stone-400">
                      {format(dia, 'EEE', { locale: ptBR })}
                    </span>
                    <span className={`text-sm font-bold ${isSameDay(dia, startOfToday()) ? 'text-amber-600' : 'text-stone-700 dark:text-stone-300'}`}>
                      {format(dia, 'dd')}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cabanas.map((cabana) => (
              <tr key={cabana.id} className="group">
                <td className="sticky left-0 z-20 bg-white dark:bg-stone-900 p-4 border-r border-b border-stone-200 dark:border-stone-800 font-bold text-stone-800 dark:text-stone-200 group-hover:bg-stone-50 dark:group-hover:bg-stone-800 transition-colors">
                  {cabana.nome}
                </td>
                {dias.map((dia) => {
                  const dataDia = startOfDay(dia);
                  
                  // Encontrar reserva que cobre este dia
                  const reserva = reservas.find(r => {
                    const checkin = startOfDay(new Date(r.data_checkin));
                    const checkout = startOfDay(new Date(r.data_checkout));
                    return r.cabana_id === cabana.id && 
                           dataDia >= checkin && 
                           dataDia < checkout;
                  });

                  if (reserva) {
                    const checkin = startOfDay(new Date(reserva.data_checkin));
                    const checkout = startOfDay(new Date(reserva.data_checkout));
                    const isStart = isSameDay(dataDia, checkin);
                    
                    if (isStart || isSameDay(dataDia, startDate)) {
                      // Cálculo de quantos dias a reserva ocupa
                      const totalDias = eachDayOfInterval({start: dataDia, end: checkout}).length - 1;
                      const diasVisiveis = eachDayOfInterval({start: dataDia, end: dias[dias.length-1]}).length;
                      const span = Math.min(totalDias, diasVisiveis);

                      return (
                        <td key={dia.toISOString()} className="p-0 border-b border-r border-stone-100 dark:border-stone-800 relative h-16">
                           <div 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (onReservaClick) onReservaClick(reserva.id);
                            }}
                            className={`absolute inset-y-3 z-30 flex items-center px-3 text-[10px] font-black text-white uppercase tracking-tighter overflow-hidden whitespace-nowrap shadow-sm cursor-pointer hover:brightness-110 active:scale-[0.98] transition-all
                              ${reserva.status === 'confirmada' ? 'bg-green-600' : 'bg-amber-500'} 
                              ${isStart ? 'rounded-l-md' : ''} 
                              ${isSameDay(addDays(dataDia, span), checkout) ? 'rounded-r-md' : ''}
                            `}
                            style={{ 
                              // Começa no meio (50%) se for o dia de check-in, senão começa no 0
                              left: isStart ? '50%' : '0%',
                              // A largura precisa compensar o deslocamento de 50%
                              width: `calc(${span * 100}% + ${span}px)`,
                              marginLeft: isStart ? '0' : '0',
                            }}
                          >
                            <span className={isStart ? 'ml-0' : ''}>{reserva.cliente?.nome || 'N/A'}</span>
                          </div>
                        </td>
                      );
                    }
                    return <td key={dia.toISOString()} className="p-0 border-b border-r border-stone-100 dark:border-stone-800 h-16"></td>;
                  }

                  return (
                    <td 
                      key={dia.toISOString()} 
                      className={`p-0 border-b border-r border-stone-100 dark:border-stone-800 h-16 group-hover:bg-stone-50/50 dark:group-hover:bg-stone-800/20 transition-colors ${
                        isSameDay(dia, startOfToday()) ? 'bg-amber-50/30 dark:bg-amber-900/10' : ''
                      }`}
                    >
                      {/* Espaço vazio para futura interação de clique e reserva */}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Legenda */}
      <div className="p-4 bg-stone-50 dark:bg-stone-800/30 border-t border-stone-100 dark:border-stone-800 flex gap-6">
        <div className="flex items-center gap-2 text-xs font-bold text-stone-500 uppercase tracking-widest">
          <div className="w-3 h-3 bg-green-600 rounded"></div>
          Confirmada
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-stone-500 uppercase tracking-widest">
          <div className="w-3 h-3 bg-amber-500 rounded"></div>
          Pendente / Airbnb
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-stone-500 uppercase tracking-widest">
          <div className="w-3 h-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded"></div>
          Hoje
        </div>
      </div>
    </div>
  );
};
