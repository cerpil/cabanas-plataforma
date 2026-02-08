import axios from 'axios';
import { Cliente, Cabana, Reserva, Mensagem, ReservaCalendario, Stats } from '../types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
});

// --- CLIENTES ---
export const clientesAPI = {
  listar: () => api.get<Cliente[]>('/api/clientes/').then(res => res.data),
  buscar: (id: number) => api.get<Cliente>(`/api/clientes/${id}`).then(res => res.data),
  criar: (data: Omit<Cliente, 'id' | 'created_at' | 'updated_at'>) => api.post<Cliente>('/api/clientes/', data).then(res => res.data),
  atualizar: (id: number, data: Partial<Cliente>) => api.put<Cliente>(`/api/clientes/${id}`, data).then(res => res.data),
  deletar: (id: number) => api.delete(`/api/clientes/${id}`).then(res => res.data),
};

// --- RESERVAS ---
export const reservasAPI = {
  listar: (params?: { cabana_id?: number; status?: string }) => 
    api.get<Reserva[]>('/api/reservas/', { params }).then(res => res.data),
  calendario: () => api.get<ReservaCalendario[]>('/api/reservas/calendario').then(res => res.data),
  buscar: (id: number) => api.get<Reserva>(`/api/reservas/${id}`).then(res => res.data),
  criar: (data: any) => api.post<Reserva>('/api/reservas/', data).then(res => res.data),
  atualizar: (id: number, data: any) => api.put<Reserva>(`/api/reservas/${id}`, data).then(res => res.data),
  cancelar: (id: number) => api.delete(`/api/reservas/${id}`).then(res => res.data),
  exportar: () => api.get('/api/reservas/export', { responseType: 'blob' }).then(res => res.data),
  relatorios: () => api.get('/api/reservas/relatorios').then(res => res.data),
  calcularPreco: (params: { cabana_id: number; data_checkin: string; data_checkout: string }) => 
    api.get<{ total: number; sinal: number; diarias: number }>('/api/reservas/calcular-preco', { params }).then(res => res.data),
  checkin: (id: number) => api.post<Reserva>(`/api/reservas/${id}/check-in`).then(res => res.data),
  checkout: (id: number) => api.post<Reserva>(`/api/reservas/${id}/check-out`).then(res => res.data),
  enviarVoucher: (id: number) => api.post(`/api/reservas/${id}/enviar-voucher`).then(res => res.data),
  listarLogs: (id: number) => api.get<AuditLog[]>(`/api/reservas/${id}/logs`).then(res => res.data),
};

// --- CABANAS ---
export const cabanasAPI = {
  listar: () => api.get<Cabana[]>('/api/cabanas/').then(res => res.data),
  stats: () => api.get<Stats>('/api/cabanas/stats').then(res => res.data),
  atualizarPrecos: (id: number, preco_semana: number, preco_fds: number) => 
    api.put<Cabana>(`/api/cabanas/${id}/precos`, null, { params: { preco_semana, preco_fds } }).then(res => res.data),
};

// --- MENSAGENS ---
export const mensagensAPI = {
  listarPorReserva: (reservaId: number) => 
    api.get<Mensagem[]>(`/api/mensagens/${reservaId}`).then(res => res.data),
  enviar: (data: { reserva_id: number; remetente: string; conteudo: string }) => 
    api.post<Mensagem>('/api/mensagens', data).then(res => res.data),
  marcarLida: (id: number) => 
    api.put<Mensagem>(`/api/mensagens/${id}/marcar-lida`).then(res => res.data),
};

// --- USUÁRIOS ---
export const usuariosAPI = {
  listar: () => api.get<any[]>('/api/usuarios/').then(res => res.data),
  criar: (data: any) => api.post<any>('/api/usuarios/', data).then(res => res.data),
  deletar: (id: number) => api.delete(`/api/usuarios/${id}`).then(res => res.data),
};

export default api;
