from fastapi import APIRouter, Depends, HTTPException, Response, UploadFile, File
from sqlalchemy.orm import Session
from ..database import get_db
from ..services.calendar_service import generate_cabana_ical, sync_airbnb_calendar
from ..services.airbnb_csv_service import process_airbnb_csv
from ..models.models import Cabana

router = APIRouter(prefix="/calendar", tags=["Calendar"])

@router.post("/upload-csv")
async def upload_airbnb_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="O arquivo deve ser um CSV")
    
    content = await file.read()
    # Agora passamos os bytes brutos
    stats = process_airbnb_csv(db, content)
    return {"status": "success", "stats": stats}

@router.get("/{cabana_id}.ics")
def get_ical(cabana_id: int, db: Session = Depends(get_db)):
    ical_content = generate_cabana_ical(db, cabana_id)
    if not ical_content:
        raise HTTPException(status_code=404, detail="Cabana não encontrada")
    
    return Response(
        content=ical_content,
        media_type="text/calendar",
        headers={
            "Content-Disposition": f"attachment; filename=cabana_{cabana_id}.ics"
        }
    )

@router.post("/sync/{cabana_id}")
def sync_calendar(cabana_id: int, db: Session = Depends(get_db)):
    success, count = sync_airbnb_calendar(db, cabana_id)
    if not success:
        raise HTTPException(status_code=400, detail="Erro ao sincronizar com Airbnb")
    
    return {"status": "success", "novas_reservas": count}

@router.patch("/set-url/{cabana_id}")
def set_airbnb_url(cabana_id: int, url: str, db: Session = Depends(get_db)):
    cabana = db.query(Cabana).filter(Cabana.id == cabana_id).first()
    if not cabana:
        raise HTTPException(status_code=404, detail="Cabana não encontrada")
    
    cabana.airbnb_ical_url = url
    db.commit()
    return {"status": "success", "message": "URL do Airbnb atualizada"}
