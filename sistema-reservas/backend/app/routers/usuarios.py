from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import models
from ..utils import auth
from pydantic import BaseModel, ConfigDict

router = APIRouter(
    prefix="/api/usuarios",
    tags=["usuários"]
)

class UserCreate(BaseModel):
    username: str
    password: str
    full_name: str
    role: str = "staff"

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    full_name: str
    role: str
    is_active: bool

@router.post("/", response_model=UserResponse)
def criar_usuario(user: UserCreate, db: Session = Depends(get_db)):
    # Verificar se já existe
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Nome de usuário já cadastrado")
    
    new_user = models.User(
        username=user.username,
        hashed_password=auth.get_password_hash(user.password),
        full_name=user.full_name,
        role=user.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.get("/", response_model=List[UserResponse])
def listar_usuarios(db: Session = Depends(get_db)):
    return db.query(models.User).all()

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_usuario(id: int, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.id == id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    if db_user.username == "admin":
        raise HTTPException(status_code=400, detail="O administrador principal não pode ser deletado")
        
    db.delete(db_user)
    db.commit()
    return None
