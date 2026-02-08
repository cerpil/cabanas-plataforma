from sqlalchemy.orm import Session
from ..models import models

def log_action(db: Session, usuario: str, acao: str, reserva_id: int = None, detalhes: str = None):
    new_log = models.AuditLog(
        usuario=usuario,
        acao=acao,
        reserva_id=reserva_id,
        detalhes=detalhes
    )
    db.add(new_log)
    db.commit()
