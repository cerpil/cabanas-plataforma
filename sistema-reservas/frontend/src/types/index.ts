export interface Cliente {
  id: number;
  nome: string;
  telefone: string;
  email?: string;
  created_at: string;
  updated_at?: string;
}

export interface Cabana {
  id: number;
  nome: string;
  numero: number;
  descricao?: string;
  capacidade: number;
  airbnb_ical_url?: string;
}

export type ReservaStatus = 'confirmada' | 'pendente' | 'cancelada' | 'concluída';

export interface Reserva {
  id: number;
  cliente_id: number;
  cabana_id: number;
  data_checkin: string;
  data_checkout: string;
  forma_pagamento?: string;
  valor_total?: number;
  status: ReservaStatus;
  origem: 'local' | 'airbnb';
  observacoes?: string;
  checked_in_at?: string;
  checked_out_at?: string;
  nota?: number;
  feedback?: string;
  created_at: string;
  updated_at?: string;
  cliente?: Cliente;
  cabana?: Cabana;
}

export interface Mensagem {
  id: number;
  reserva_id: number;
  remetente: 'cliente' | 'sistema';
  conteudo: string;
  created_at: string;
  lida: boolean;
}

export interface ReservaCalendario {
  id: number;
  title: string;
  start: string;
  end: string;
  cabana_id: number;
  status: ReservaStatus;
}

export interface AuditLog {
  id: number;
  reserva_id?: number;
  usuario: string;
  acao: string;
  detalhes?: string;
  created_at: string;
}

export interface Stats {
  total_reservas: number;
  confirmadas: number;
  pendentes: number;
  total_clientes: number;
  cabanas_status: Array<{
    id: number;
    nome: string;
    numero: number;
    status: 'Livre' | 'Ocupada';
  }>;
}
