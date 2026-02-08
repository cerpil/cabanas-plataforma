from app.database import engine, Base, SessionLocal
from app.models.models import Cabana, User, Cliente, Reserva, Mensagem
from app.utils.auth import get_password_hash
from datetime import date, timedelta, datetime
import random

def init_db():
    # Cria todas as tabelas
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    # Criar Usuário Admin se não existir
    if db.query(User).count() == 0:
        admin = User(
            username="admin",
            hashed_password=get_password_hash("admin123"),
            full_name="Administrador Cabanas",
            role="admin",
            is_active=True
        )
        db.add(admin)
        db.commit()
        print("Usuário Admin criado: admin / admin123")

    # Cadastrar Cabanas
    if db.query(Cabana).count() == 0:
        cabanas_iniciais = [
            Cabana(
                nome="Cabana na Mata", numero=1, 
                descricao="Experiência intimista e silêncio absoluto.", 
                capacidade=2, preco_base_semana=490.0, preco_base_fds=690.0,
                imagem_url="/assets/cabanas/cabana1.png"
            ),
            Cabana(
                nome="Cabana sobre a Mata", numero=2, 
                descricao="Ofurô exclusivo com vista panorâmica.", 
                capacidade=2, preco_base_semana=590.0, preco_base_fds=890.0,
                imagem_url="/assets/cabanas/cabana2.png"
            ),
            Cabana(
                nome="Cabana Hobbit", numero=3, 
                descricao="Arquitetura moderna e conforto premium.", 
                capacidade=2, preco_base_semana=550.0, preco_base_fds=790.0,
                imagem_url="/assets/cabanas/cabana3.png"
            ),
        ]
        db.add_all(cabanas_iniciais)
        db.commit()
        print("Cabanas cadastradas!")

    db.close()

if __name__ == "__main__":
    init_db()