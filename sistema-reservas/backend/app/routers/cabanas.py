from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import models
from ..schemas import schemas

router = APIRouter(
    prefix="/api/cabanas",
    tags=["cabanas"]
)

@router.get("/", response_model=List[schemas.CabanaResponse])
def listar_cabanas(db: Session = Depends(get_db)):
    return db.query(models.Cabana).all()

from datetime import date

@router.get("/stats")
def estatisticas(db: Session = Depends(get_db)):
    # ... (código existente) ...
    return {
        "total_reservas": total_reservas,
        "confirmadas": confirmadas,
        "pendentes": pendentes,
        "total_clientes": total_clientes,
        "cabanas_status": cabanas_status
    }

@router.put("/{id}", response_model=schemas.CabanaResponse)
def atualizar_cabana(id: int, cabana_data: schemas.CabanaBase, db: Session = Depends(get_db)):
    db_cabana = db.query(models.Cabana).filter(models.Cabana.id == id).first()
    if not db_cabana:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Cabana não encontrada")
    
    for key, value in cabana_data.model_dump().items():
        setattr(db_cabana, key, value)
    
    db.commit()
    db.refresh(db_cabana)
    return db_cabana

@router.put("/{id}/precos", response_model=schemas.CabanaResponse)
def atualizar_precos(id: int, preco_semana: float, preco_fds: float, db: Session = Depends(get_db)):
    cabana = db.query(models.Cabana).filter(models.Cabana.id == id).first()
    if not cabana:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Cabana não encontrada")
    
    cabana.preco_base_semana = preco_semana
    cabana.preco_base_fds = preco_fds
    db.commit()
    db.refresh(cabana)
    return cabana
