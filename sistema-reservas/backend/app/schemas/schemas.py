from pydantic import BaseModel, ConfigDict
from datetime import datetime, date
from typing import List, Optional

# --- SCHEMAS DE CABANA ---
class CabanaBase(BaseModel):
    nome: str
    numero: int
    descricao: Optional[str] = None
    capacidade: int = 2
    preco_base_semana: float = 0.0
    preco_base_fds: float = 0.0
    imagem_url: Optional[str] = None
    full_description: Optional[str] = None
    amenities: Optional[str] = None
    galeria_urls: Optional[str] = None

class CabanaResponse(CabanaBase):
    id: int
    airbnb_ical_url: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

# --- SCHEMAS DE CLIENTE ---
class ClienteBase(BaseModel):
    nome: str
    telefone: str
    email: Optional[str] = None

class ClienteCreate(ClienteBase):
    pass

class ClienteUpdate(BaseModel):
    nome: Optional[str] = None
    telefone: Optional[str] = None
    email: Optional[str] = None

class ClienteResponse(ClienteBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

# --- SCHEMAS DE MENSAGEM ---
class MensagemBase(BaseModel):
    remetente: str
    conteudo: str

class MensagemCreate(MensagemBase):
    reserva_id: int

class MensagemResponse(MensagemBase):
    id: int
    reserva_id: int
    created_at: datetime
    lida: bool
    model_config = ConfigDict(from_attributes=True)

class AuditLogResponse(BaseModel):
    id: int
    reserva_id: Optional[int]
    usuario: str
    acao: str
    detalhes: Optional[str]
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# --- SCHEMAS DE RESERVA ---
class ReservaBase(BaseModel):
    cabana_id: int
    data_checkin: date
    data_checkout: date
    forma_pagamento: Optional[str] = None
    valor_total: Optional[float] = None
    valor_sinal: Optional[float] = 0.0
    pago_sinal: bool = False
    pago_total: bool = False
    status: str = "pendente"
    origem: str = "local"
    observacoes: Optional[str] = None

class ReservaCreate(ReservaBase):
    cliente_id: int

class ReservaUpdate(BaseModel):
    data_checkin: Optional[date] = None
    data_checkout: Optional[date] = None
    forma_pagamento: Optional[str] = None
    valor_total: Optional[float] = None
    valor_sinal: Optional[float] = None
    pago_sinal: Optional[bool] = None
    pago_total: Optional[bool] = None
    status: Optional[str] = None
    observacoes: Optional[str] = None
    nota: Optional[int] = None
    feedback: Optional[str] = None

class ReservaResponse(ReservaBase):
    id: int
    cliente_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    checked_in_at: Optional[datetime] = None
    checked_out_at: Optional[datetime] = None
    nota: Optional[int] = None
    feedback: Optional[str] = None
    
    # Relacionamentos opcionais
    cliente: Optional[ClienteResponse] = None
    cabana: Optional[CabanaResponse] = None
    
    model_config = ConfigDict(from_attributes=True)

# --- SCHEMA DE CALENDÁRIO ---
class ReservaCalendario(BaseModel):
    id: int
    title: str # Nome do cliente + Cabana
    start: date
    end: date
    cabana_id: int
    status: str
    model_config = ConfigDict(from_attributes=True)