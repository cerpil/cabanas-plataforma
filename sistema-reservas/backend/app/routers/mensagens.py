from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import models
from ..schemas import schemas

router = APIRouter(
    prefix="/api/mensagens",
    tags=["mensagens"]
)

@router.post("/", response_model=schemas.MensagemResponse, status_code=status.HTTP_201_CREATED)
def enviar_mensagem(mensagem: schemas.MensagemCreate, db: Session = Depends(get_db)):
    reserva = db.query(models.Reserva).filter(models.Reserva.id == mensagem.reserva_id).first()
    if not reserva:
        raise HTTPException(status_code=404, detail="Reserva não encontrada")
        
    db_mensagem = models.Mensagem(**mensagem.model_dump())
    db.add(db_mensagem)
    db.commit()
    db.refresh(db_mensagem)
    return db_mensagem

@router.get("/{reserva_id}", response_model=List[schemas.MensagemResponse])
def listar_mensagens_por_reserva(reserva_id: int, db: Session = Depends(get_db)):
    # Log para depuração
    print(f"Buscando mensagens para a reserva ID: {reserva_id}")
    mensagens = db.query(models.Mensagem).filter(models.Mensagem.reserva_id == reserva_id).order_by(models.Mensagem.created_at.asc()).all()
    return mensagens

@router.put("/{id}/marcar-lida", response_model=schemas.MensagemResponse)
def marcar_lida(id: int, db: Session = Depends(get_db)):
    mensagem = db.query(models.Mensagem).filter(models.Mensagem.id == id).first()
    if not mensagem:
        raise HTTPException(status_code=404, detail="Mensagem não encontrada")
    
    mensagem.lida = True
    db.commit()
    db.refresh(mensagem)
    return mensagem