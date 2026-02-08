'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reservasAPI, mensagensAPI } from '@/services/api';
import { Modal } from '@/components/ui/Modal';
import { Loading } from '@/components/ui/Loading';
import { Button } from '@/components/ui/Button';
import {
  Calendar,
  User,
  Phone,
  Mail,
  CreditCard,
  Send,
  Trash2,
  CheckCircle2,
  MessageCircle,
  LogIn,
  LogOut,
  Star,
  CheckCircle,
  AlertCircle,
  History
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';

interface ReservaDetalhesModalProps {
  reservaId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReservaDetalhesModal: React.FC<ReservaDetalhesModalProps> = ({
  reservaId,
  isOpen,
  onClose
}) => {
  const queryClient = useQueryClient();
  const [mensagemText, setMensagemText] = useState('');
  const [localNota, setLocalNota] = useState(0);
  const [localFeedback, setLocalFeedback] = useState('');

  const { data: reserva, isLoading: reservaLoading } = useQuery({
    queryKey: ['reserva', reservaId],
    queryFn: () => reservaId ? reservasAPI.buscar(reservaId) : null,
    enabled: !!reservaId && isOpen,
  });

  const { data: mensagens, isLoading: mensagensLoading } = useQuery({
    queryKey: ['mensagens', reservaId],
    queryFn: () => reservaId ? mensagensAPI.listarPorReserva(reservaId) : [],
    enabled: !!reservaId && isOpen,
  });

  const { data: logs, isLoading: logsLoading } = useQuery({
    queryKey: ['logs', reservaId],
    queryFn: () => reservaId ? reservasAPI.listarLogs(reservaId) : [],
    enabled: !!reservaId && isOpen,
  });

  useEffect(() => {
    if (reserva) {
      setLocalNota(reserva.nota || 0);
      setLocalFeedback(reserva.feedback || '');
    }
  }, [reserva]);

  const updateStatusMutation = useMutation({
    mutationFn: (status: string) => reservasAPI.atualizar(reservaId!, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reserva', reservaId] });
      queryClient.invalidateQueries({ queryKey: ['reservas-calendario'] });
      toast.success('Status atualizado!');
    },
    onError: () => toast.error('Erro ao atualizar status'),
  });

  const checkinMutation = useMutation({
    mutationFn: () => reservasAPI.checkin(reservaId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reserva', reservaId] });
      queryClient.invalidateQueries({ queryKey: ['reservas-calendario'] });
      toast.success('Hóspede deu entrada!');
    }
  });

  const checkoutMutation = useMutation({
    mutationFn: () => reservasAPI.checkout(reservaId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reserva', reservaId] });
      queryClient.invalidateQueries({ queryKey: ['reservas-calendario'] });
      toast.success('Check-out realizado!');
    }
  });

  const enviarVoucherMutation = useMutation({
    mutationFn: () => reservasAPI.enviarVoucher(reservaId!),
    onSuccess: () => toast.success('Voucher enviado!'),
    onError: () => toast.error('Erro ao enviar voucher.'),
  });

  const enviarMsgMutation = useMutation({
    mutationFn: (conteudo: string) => mensagensAPI.enviar({ reserva_id: reservaId!, remetente: 'sistema', conteudo }),
    onSuccess: () => {
      setMensagemText('');
      queryClient.invalidateQueries({ queryKey: ['mensagens', reservaId] });
      toast.success('Mensagem enviada');
    }
  });

  const updateFeedbackMutation = useMutation({
    mutationFn: (data: { nota: number; feedback: string }) => reservasAPI.atualizar(reservaId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reserva', reservaId] });
      toast.success('Avaliação salva!');
    }
  });

  const togglePaymentMutation = useMutation({
    mutationFn: (data: { pago_sinal?: boolean; pago_total?: boolean }) => reservasAPI.atualizar(reservaId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reserva', reservaId] });
      toast.success('Pagamento atualizado!');
    }
  });

  const handleWhatsAppConfirmation = () => {
    if (!reserva || !reserva.cliente) return;
    const msg = `Olá *${reserva.cliente.nome}*! Confirmamos sua reserva nas *Cabanas na Mata* 🌿\n\n` +
      `🏡 *Cabana:* ${reserva.cabana?.nome}\n` +
      `📅 *Check-in:* ${format(parseISO(reserva.data_checkin), 'dd/MM/yyyy')}\n` +
      `📅 *Check-out:* ${format(parseISO(reserva.data_checkout), 'dd/MM/yyyy')}\n` +
      `💰 *Valor Total:* R$ ${reserva.valor_total?.toLocaleString('pt-BR')}\n\n` +
      `Estamos ansiosos para recebê-los!`;
    window.open(`https://wa.me/55${reserva.cliente.telefone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Detalhes da Reserva #${reservaId}`} size="lg">
      {reservaLoading ? <Loading /> : reserva && (
        <div className="space-y-8">
          <div className="flex items-center justify-between p-4 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-100 dark:border-stone-700">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300">{reserva.status}</span>
              <p className="text-xs text-stone-500 dark:text-stone-400">Criada em {format(parseISO(reserva.created_at), 'dd/MM/yy')}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => enviarVoucherMutation.mutate()} isLoading={enviarVoucherMutation.isPending} disabled={!reserva.cliente?.email} className="dark:border-stone-700 dark:text-stone-300"><Mail size={16} className="mr-2" /> Voucher</Button>
              <Button variant="outline" size="sm" className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-100 dark:border-green-800" onClick={handleWhatsAppConfirmation}><MessageCircle size={16} className="mr-2" /> WhatsApp</Button>
              {reserva.status === 'pendente' && <Button variant="secondary" size="sm" onClick={() => updateStatusMutation.mutate('confirmada')}><CheckCircle2 size={16} className="mr-2" /> Confirmar</Button>}
              {reserva.status === 'confirmada' && !reserva.checked_in_at && <Button variant="secondary" size="sm" onClick={() => checkinMutation.mutate()}><LogIn size={16} className="mr-2" /> Check-in</Button>}
              {reserva.checked_in_at && !reserva.checked_out_at && <Button variant="primary" size="sm" onClick={() => checkoutMutation.mutate()}><LogOut size={16} className="mr-2" /> Check-out</Button>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-4 rounded-xl border flex items-center justify-between ${reserva.pago_sinal ? 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800' : 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800'}`}>
              <div><p className="text-[10px] font-black uppercase text-stone-400 dark:text-stone-500">Sinal (50%)</p><p className="text-lg font-bold text-stone-800 dark:text-stone-100">R$ {reserva.valor_sinal.toLocaleString('pt-BR')}</p></div>
              <button onClick={() => togglePaymentMutation.mutate({ pago_sinal: !reserva.pago_sinal })} className={`p-2 rounded-lg transition-colors ${reserva.pago_sinal ? 'bg-green-600 text-white' : 'bg-white dark:bg-stone-800 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-700'}`}>{reserva.pago_sinal ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}</button>
            </div>
            <div className={`p-4 rounded-xl border flex items-center justify-between ${reserva.pago_total ? 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800' : 'bg-stone-50 dark:bg-stone-800/30 border-stone-100 dark:border-stone-700'}`}>
              <div><p className="text-[10px] font-black uppercase text-stone-400 dark:text-stone-500">Total</p><p className="text-lg font-bold text-stone-800 dark:text-stone-100">R$ {reserva.valor_total?.toLocaleString('pt-BR')}</p></div>
              <button onClick={() => togglePaymentMutation.mutate({ pago_total: !reserva.pago_total })} className={`p-2 rounded-lg transition-colors ${reserva.pago_total ? 'bg-green-600 text-white' : 'bg-white dark:bg-stone-800 text-stone-400 dark:text-stone-500 border border-stone-200 dark:border-stone-700'}`}>{reserva.pago_total ? <CheckCircle2 size={20} /> : <CreditCard size={20} />}</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase text-stone-400 dark:text-stone-500">Hóspede</h4>
              <p className="font-bold text-stone-800 dark:text-stone-100">{reserva.cliente?.nome}</p>
              <p className="text-sm text-stone-500 dark:text-stone-400">{reserva.cliente?.telefone}</p>
            </div>
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase text-stone-400 dark:text-stone-500">Estadia</h4>
              <p className="font-bold text-stone-800 dark:text-stone-100">{format(parseISO(reserva.data_checkin), 'dd/MM')} — {format(parseISO(reserva.data_checkout), 'dd/MM')}</p>
              <p className="text-sm text-stone-500 dark:text-stone-400">{reserva.cabana?.nome}</p>
            </div>
          </div>

          {reserva.checked_out_at && (
            <div className="space-y-4 pt-6 border-t border-stone-100 bg-stone-50 dark:bg-stone-800/50 p-4 rounded-xl">
              <h4 className="text-sm font-black uppercase tracking-widest text-stone-400">Avaliação da Estadia</h4>
              <div className="flex flex-col gap-4">
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} onClick={() => setLocalNota(star)} className={`transition-colors ${localNota >= star ? 'text-yellow-500' : 'text-stone-300'}`}><Star size={24} fill={localNota >= star ? 'currentColor' : 'none'} /></button>
                  ))}
                </div>
                <textarea value={localFeedback} onChange={(e) => setLocalFeedback(e.target.value)} placeholder="Depoimento do hóspede..." className="w-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-4 py-2 text-sm" rows={3} />
                <Button onClick={() => updateFeedbackMutation.mutate({ nota: localNota, feedback: localFeedback })} isLoading={updateFeedbackMutation.isPending} size="sm" className="w-fit">Salvar Avaliação</Button>
              </div>
            </div>
          )}

          <div className="space-y-4 pt-6 border-t border-stone-100">
            <h4 className="text-sm font-black uppercase tracking-widest text-stone-400">Mensagens e Notas</h4>
            <div className="bg-stone-50 dark:bg-stone-800/30 rounded-xl p-4 max-h-[200px] overflow-y-auto space-y-4">
              {mensagens?.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.remetente === 'sistema' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    msg.remetente === 'sistema' 
                      ? 'bg-stone-800 dark:bg-stone-700 text-white' 
                      : 'bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-100'
                  }`}>
                    {msg.conteudo}
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); if(mensagemText.trim()) enviarMsgMutation.mutate(mensagemText); }} className="flex gap-2">
              <input type="text" value={mensagemText} onChange={(e) => setMensagemText(e.target.value)} placeholder="Nota interna..." className="flex-1 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-4 py-2 text-sm" />
              <Button type="submit" disabled={!mensagemText.trim()} isLoading={enviarMsgMutation.isPending}><Send size={18} /></Button>
            </form>
          </div>

          <div className="space-y-4 pt-6 border-t border-stone-100">
            <h4 className="text-sm font-black uppercase tracking-widest text-stone-400 flex items-center gap-2"><History size={14} /> Histórico</h4>
            <div className="space-y-2">
              {logs?.map((log) => (
                <div key={log.id} className="text-[10px] text-stone-500"><span className="font-bold text-stone-700 dark:text-stone-300">@{log.usuario}</span> {log.acao} • {format(parseISO(log.created_at), "dd/MM HH:mm")}</div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};