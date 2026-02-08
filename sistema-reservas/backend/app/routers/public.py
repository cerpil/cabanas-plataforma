from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import date
from ..database import get_db
from ..models import models
from ..schemas import schemas
from sqlalchemy import and_

router = APIRouter(
    prefix="/api/public",
    tags=["public"]
)

@router.get("/cabanas", response_model=List[schemas.CabanaResponse])
def listar_cabanas_publico(db: Session = Depends(get_db)):
    return db.query(models.Cabana).all()

@router.get("/disponibilidade/{cabana_id}")
def verificar_disponibilidade(cabana_id: int, inicio: date, fim: date, db: Session = Depends(get_db)):
    # ... (existente)
    return {"disponivel": True}

@router.get("/ocupacao/{cabana_id}")
def listar_datas_ocupadas(cabana_id: int, db: Session = Depends(get_db)):
    from datetime import timedelta
    reservas = db.query(models.Reserva).filter(
        models.Reserva.cabana_id == cabana_id,
        models.Reserva.status != "cancelada"
    ).all()
    
    datas_bloqueadas = []
    for r in reservas:
        curr = r.data_checkin
        while curr < r.data_checkout:
            datas_bloqueadas.append(curr.isoformat())
            curr += timedelta(days=1)
            
    return datas_bloqueadas

@router.get("/calcular-preco")
def calcular_preco_publico(
    cabana_id: int, 
    data_checkin: date, 
    data_checkout: date, 
    adultos: int = 2, 
    criancas: int = 0,
    db: Session = Depends(get_db)
):
    from datetime import timedelta
    cabana = db.query(models.Cabana).filter(models.Cabana.id == cabana_id).first()
    if not cabana or data_checkout <= data_checkin:
        return {"total": 0, "sinal": 0, "diarias": 0}

    total, diarias, current = 0.0, 0, data_checkin
    while current < data_checkout:
        # Preço Base
        valor_dia = cabana.preco_base_fds if current.weekday() in [4, 5] else cabana.preco_base_semana
        
        # Lógica de Hóspede Extra (Apenas na Hobbit - ID 3)
        if cabana_id == 3 and adultos > 2:
            adultos_extras = adultos - 2
            valor_dia += (adultos_extras * 350.0)
            
        total += valor_dia
        current += timedelta(days=1)
        diarias += 1
        
    return {"total": total, "sinal": total * 0.5, "diarias": diarias}

from pydantic import BaseModel

class SolicitacaoReserva(BaseModel):
    nome: str
    telefone: str
    email: str
    cabana_id: int
    data_checkin: date
    data_checkout: date
    adultos: int = 2
    criancas: int = 0

@router.post("/reservar")
def solicitar_reserva(solicitacao: SolicitacaoReserva, db: Session = Depends(get_db)):
    # 1. Verificar disponibilidade novamente
    conflito = db.query(models.Reserva).filter(
        models.Reserva.cabana_id == solicitacao.cabana_id,
        models.Reserva.status != "cancelada",
        and_(
            solicitacao.data_checkin < models.Reserva.data_checkout,
            solicitacao.data_checkout > models.Reserva.data_checkin
        )
    ).first()
    
    if conflito:
        raise HTTPException(status_code=400, detail="Desculpe, estas datas foram reservadas recentemente.")

    # 2. Criar ou buscar cliente
    cliente = db.query(models.Cliente).filter(models.Cliente.email == solicitacao.email).first()
    if not cliente:
        cliente = models.Cliente(nome=solicitacao.nome, telefone=solicitacao.telefone, email=solicitacao.email)
        db.add(cliente)
        db.flush()

    # 3. Calcular Valor Total com hóspedes
    from .public import calcular_preco_publico
    orcamento = calcular_preco_publico(
        solicitacao.cabana_id, 
        solicitacao.data_checkin, 
        solicitacao.data_checkout, 
        solicitacao.adultos, 
        solicitacao.criancas, 
        db
    )

    # 4. Criar reserva pendente
    nova_reserva = models.Reserva(
        cliente_id=cliente.id,
        cabana_id=solicitacao.cabana_id,
        data_checkin=solicitacao.data_checkin,
        data_checkout=solicitacao.data_checkout,
        valor_total=orcamento["total"],
        valor_sinal=0.0,
        status="pendente",
        origem="local",
        observacoes=f"Solicitação via Landing Page. Hóspedes: {solicitacao.adultos} adultos, {solicitacao.criancas} crianças."
    )
    db.add(nova_reserva)
    db.commit()
    db.refresh(nova_reserva)

    return {"status": "success", "reserva_id": nova_reserva.id}
