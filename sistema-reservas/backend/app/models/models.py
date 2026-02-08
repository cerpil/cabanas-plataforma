from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Date, Boolean, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base

class Cliente(Base):
    __tablename__ = "clientes"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    telefone = Column(String, nullable=False)
    email = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    reservas = relationship("Reserva", back_populates="cliente")

class Cabana(Base):
    __tablename__ = "cabanas"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    numero = Column(Integer, unique=True, index=True)
    descricao = Column(Text, nullable=True)
    capacidade = Column(Integer, default=2)
    preco_base_semana = Column(Float, default=0.0)
    preco_base_fds = Column(Float, default=0.0)
    imagem_url = Column(String, nullable=True)
    airbnb_ical_url = Column(String, nullable=True)
    full_description = Column(Text, nullable=True)
    amenities = Column(Text, nullable=True) # Armazenado como string separada por vírgula ou JSON
    galeria_urls = Column(Text, nullable=True) # Armazenado como string separada por vírgula

    reservas = relationship("Reserva", back_populates="cabana")

class Reserva(Base):
    __tablename__ = "reservas"

    id = Column(Integer, primary_key=True, index=True)
    cliente_id = Column(Integer, ForeignKey("clientes.id"))
    cabana_id = Column(Integer, ForeignKey("cabanas.id"))
    data_checkin = Column(Date, nullable=False)
    data_checkout = Column(Date, nullable=False)
    forma_pagamento = Column(String)
    valor_total = Column(Float)
    valor_sinal = Column(Float, default=0.0)
    pago_sinal = Column(Boolean, default=False)
    pago_total = Column(Boolean, default=False)
    status = Column(String, default="pendente") # confirmada, pendente, cancelada, concluída
    origem = Column(String, default="local") # local, airbnb
    observacoes = Column(Text, nullable=True)
    checked_in_at = Column(DateTime(timezone=True), nullable=True)
    checked_out_at = Column(DateTime(timezone=True), nullable=True)
    
    # Novos campos de pagamento (Plano de Pagamentos 2.2)
    pagamento_status = Column(String, default="nao_pago") # nao_pago, parcialmente_pago, pago, reembolsado
    total_pago = Column(Float, default=0.0)
    metodo_pagamento_preferido = Column(String, nullable=True)
    requer_pagamento_antecipado = Column(Boolean, default=True)

    nota = Column(Integer, nullable=True) # 1 a 5
    feedback = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    cliente = relationship("Cliente", back_populates="reservas")
    cabana = relationship("Cabana", back_populates="reservas")
    mensagens = relationship("Mensagem", back_populates="reserva")
    pagamentos = relationship("Pagamento", back_populates="reserva")

class Pagamento(Base):
    __tablename__ = "pagamentos"

    id = Column(Integer, primary_key=True, index=True)
    reserva_id = Column(Integer, ForeignKey("reservas.id"))
    metodo_pagamento = Column(String) # apple_pay, google_pay, pix, bitcoin
    valor = Column(Float)
    moeda = Column(String, default="BRL")
    status = Column(String, default="pendente") # pendente, processando, confirmado, falhou, cancelado, reembolsado
    transaction_id = Column(String, unique=True, index=True, nullable=True)
    payment_intent_id = Column(String, nullable=True)
    pix_qr_code = Column(Text, nullable=True)
    pix_copia_cola = Column(Text, nullable=True)
    pix_expiracao = Column(DateTime, nullable=True)
    btc_address = Column(String, nullable=True)
    btc_amount = Column(Float, nullable=True)
    btc_invoice_url = Column(String, nullable=True)
    metadata_json = Column(Text, nullable=True) # JSON formatado como string
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    paid_at = Column(DateTime(timezone=True), nullable=True)

    reserva = relationship("Reserva", back_populates="pagamentos")

class WebhookLog(Base):
    __tablename__ = "webhook_logs"

    id = Column(Integer, primary_key=True, index=True)
    provedor = Column(String) # stripe, inter, btcpay
    evento_tipo = Column(String)
    payload = Column(Text)
    processado = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Mensagem(Base):
    __tablename__ = "mensagens"

    id = Column(Integer, primary_key=True, index=True)
    reserva_id = Column(Integer, ForeignKey("reservas.id"))
    remetente = Column(String) # cliente ou sistema
    conteudo = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    lida = Column(Boolean, default=False)

    reserva = relationship("Reserva", back_populates="mensagens")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    reserva_id = Column(Integer, ForeignKey("reservas.id"), nullable=True)
    usuario = Column(String) # Nome do usuário que fez a ação
    acao = Column(String) # Ex: "Check-in realizado", "Status alterado"
    detalhes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    role = Column(String, default="staff") # admin, staff
    is_active = Column(Boolean, default=True)
