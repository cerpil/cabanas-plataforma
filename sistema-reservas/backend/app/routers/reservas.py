from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func, extract
from typing import List, Optional
from datetime import date, timedelta
import io
import csv

from ..database import get_db
from ..models import models
from ..schemas import schemas
from ..utils import email as email_util
from ..utils import logging as log_util

router = APIRouter(
    prefix="/api/reservas",
    tags=["reservas"]
)

@router.post("/", response_model=schemas.ReservaResponse, status_code=status.HTTP_201_CREATED)
def criar_reserva(reserva: schemas.ReservaCreate, db: Session = Depends(get_db)):
    if reserva.data_checkout <= reserva.data_checkin:
        raise HTTPException(status_code=400, detail="Data de check-out deve ser após o check-in")

    conflito = db.query(models.Reserva).filter(
        models.Reserva.cabana_id == reserva.cabana_id,
        models.Reserva.status != "cancelada",
        and_(
            reserva.data_checkin < models.Reserva.data_checkout,
            reserva.data_checkout > models.Reserva.data_checkin
        )
    ).first()

    if conflito:
        raise HTTPException(
            status_code=400, 
            detail=f"Cabana não disponível nestas datas. Conflito com reserva #{conflito.id}"
        )

    db_reserva = models.Reserva(**reserva.model_dump())
    db.add(db_reserva)
    db.commit()
    db.refresh(db_reserva)
    
    log_util.log_action(db, "admin", "Criação de Reserva", db_reserva.id)
    return db_reserva

@router.get("/", response_model=List[schemas.ReservaResponse])
def listar_reservas(
    cabana_id: Optional[int] = None, 
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Reserva)
    if cabana_id:
        query = query.filter(models.Reserva.cabana_id == cabana_id)
    if status:
        query = query.filter(models.Reserva.status == status)
    return query.all()

@router.get("/calendario", response_model=List[schemas.ReservaCalendario])
def dados_calendario(db: Session = Depends(get_db)):
    reservas = db.query(models.Reserva).filter(models.Reserva.status != "cancelada").all()
    resultado = []
    for r in reservas:
        cliente_nome = r.cliente.nome if r.cliente else "N/A"
        # Se for Airbnb e o cliente for o import padrão, melhora o título
        title = f"{cliente_nome} - {r.cabana.nome}"
        if r.origem == "airbnb" and cliente_nome == "Airbnb Import":
            title = f"Airbnb - {r.cabana.nome}"
            
        resultado.append({
            "id": r.id,
            "title": title,
            "start": r.data_checkin,
            "end": r.data_checkout,
            "cabana_id": r.cabana_id,
            "status": r.status
        })
    return resultado

@router.get("/export")
def exportar_reservas(db: Session = Depends(get_db)):
    reservas = db.query(models.Reserva).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Cliente", "Telefone", "Cabana", "Check-in", "Check-out", "Valor", "Status", "Origem"])
    for r in reservas:
        writer.writerow([
            r.id, r.cliente.nome if r.cliente else "N/A", 
            r.cliente.telefone if r.cliente else "N/A",
            r.cabana.nome, r.data_checkin, r.data_checkout, 
            r.valor_total, r.status, r.origem
        ])
    output.seek(0)
    return StreamingResponse(iter([output.getvalue()]), media_type="text/csv", 
                             headers={"Content-Disposition": "attachment; filename=reservas.csv"})

@router.get("/relatorios")
def relatorios_financeiros(db: Session = Depends(get_db)):
    faturamento_mensal = db.query(
        extract('month', models.Reserva.data_checkin).label('mes'),
        extract('year', models.Reserva.data_checkin).label('ano'),
        func.sum(models.Reserva.valor_total).label('total')
    ).filter(models.Reserva.status.in_(['confirmada', 'concluída'])).group_by('ano', 'mes').all()

    ocupacao_por_cabana = db.query(
        models.Reserva.cabana_id,
        func.count(models.Reserva.id).label('total_reservas'),
        func.sum(models.Reserva.valor_total).label('faturamento')
    ).filter(models.Reserva.status.in_(['confirmada', 'concluída'])).group_by(models.Reserva.cabana_id).all()

    return {
        "mensal": [{"mes": int(f[0]), "ano": int(f[1]), "total": f[2]} for f in faturamento_mensal],
        "por_cabana": [{"cabana_id": o[0], "reservas": o[1], "faturamento": o[2]} for o in ocupacao_por_cabana]
    }

@router.get("/calcular-preco")
def calcular_preco_sugerido(cabana_id: int, data_checkin: date, data_checkout: date, db: Session = Depends(get_db)):
    cabana = db.query(models.Cabana).filter(models.Cabana.id == cabana_id).first()
    if not cabana or data_checkout <= data_checkin:
        return {"total": 0, "sinal": 0, "diarias": 0}

    total, diarias, current = 0.0, 0, data_checkin
    while current < data_checkout:
        total += cabana.preco_base_fds if current.weekday() in [4, 5] else cabana.preco_base_semana
        current += timedelta(days=1)
        diarias += 1
    return {"total": total, "sinal": total * 0.5, "diarias": diarias}

@router.post("/{id}/check-in", response_model=schemas.ReservaResponse)
def registrar_checkin(id: int, db: Session = Depends(get_db)):
    db_reserva = db.query(models.Reserva).filter(models.Reserva.id == id).first()
    if not db_reserva: raise HTTPException(status_code=404)
    db_reserva.checked_in_at, db_reserva.status = func.now(), "confirmada"
    db.commit()
    log_util.log_action(db, "admin", "Check-in realizado", id)
    return db_reserva

@router.post("/{id}/check-out", response_model=schemas.ReservaResponse)
def registrar_checkout(id: int, db: Session = Depends(get_db)):
    db_reserva = db.query(models.Reserva).filter(models.Reserva.id == id).first()
    if not db_reserva: raise HTTPException(status_code=404)
    db_reserva.checked_out_at, db_reserva.status = func.now(), "concluída"
    db.commit()
    log_util.log_action(db, "admin", "Check-out realizado", id)
    return db_reserva

@router.post("/{id}/enviar-voucher")
async def enviar_voucher(id: int, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    db_reserva = db.query(models.Reserva).filter(models.Reserva.id == id).first()
    if not db_reserva or not db_reserva.cliente.email: raise HTTPException(status_code=400)
    
    template_data = {
        "cliente_nome": db_reserva.cliente.nome, "cabana_nome": db_reserva.cabana.nome,
        "cabana_numero": db_reserva.cabana.numero, "data_checkin": db_reserva.data_checkin.strftime("%d/%m/%Y"),
        "data_checkout": db_reserva.data_checkout.strftime("%d/%m/%Y"),
        "pago_sinal": db_reserva.pago_sinal, "pago_total": db_reserva.pago_total
    }
    background_tasks.add_task(email_util.enviar_voucher_email, db_reserva.cliente.email, template_data)
    log_util.log_action(db, "admin", "Voucher enviado por e-mail", id)
    return {"message": "Enviado"}

@router.get("/{id}/logs", response_model=List[schemas.AuditLogResponse])
def listar_logs_reserva(id: int, db: Session = Depends(get_db)):
    return db.query(models.AuditLog).filter(models.AuditLog.reserva_id == id).order_by(models.AuditLog.created_at.desc()).all()

@router.get("/{id}", response_model=schemas.ReservaResponse)
def buscar_reserva(id: int, db: Session = Depends(get_db)):
    res = db.query(models.Reserva).filter(models.Reserva.id == id).first()
    if not res: raise HTTPException(status_code=404)
    return res

@router.put("/{id}", response_model=schemas.ReservaResponse)
def atualizar_reserva(id: int, reserva_update: schemas.ReservaUpdate, db: Session = Depends(get_db)):
    db_reserva = db.query(models.Reserva).filter(models.Reserva.id == id).first()
    if not db_reserva: raise HTTPException(status_code=404)
    
    update_data = reserva_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_reserva, key, value)
    
    db.commit()
    db.refresh(db_reserva)
    log_util.log_action(db, "admin", "Reserva atualizada", id, str(update_data))
    return db_reserva

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def cancelar_reserva(id: int, db: Session = Depends(get_db)):
    db_reserva = db.query(models.Reserva).filter(models.Reserva.id == id).first()
    if not db_reserva: raise HTTPException(status_code=404)
    db_reserva.status = "cancelada"
    db.commit()
    log_util.log_action(db, "admin", "Reserva cancelada", id)
    return None