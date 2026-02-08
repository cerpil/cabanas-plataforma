import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database import Base, get_db

# Configuração de um banco de dados em memória para testes
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    # Popular dados iniciais necessários
    db = TestingSessionLocal()
    from app.models.models import Cabana, Cliente
    if db.query(Cabana).count() == 0:
        db.add(Cabana(id=1, nome="Teste Cabana", numero=101, capacidade=2))
        db.add(Cliente(id=1, nome="Cliente Teste", telefone="123456789"))
        db.commit()
    db.close()
    yield
    Base.metadata.drop_all(bind=engine)

def test_criar_reserva_sucesso():
    response = client.post(
        "/api/reservas/",
        json={
            "cliente_id": 1,
            "cabana_id": 1,
            "data_checkin": "2026-05-01",
            "data_checkout": "2026-05-05",
            "forma_pagamento": "Pix",
            "valor_total": 500.0
        }
    )
    assert response.status_code == 201
    assert response.json()["status"] == "pendente"

def test_conflito_de_reservas():
    # 1. Cria a primeira reserva
    client.post(
        "/api/reservas/",
        json={
            "cliente_id": 1,
            "cabana_id": 1,
            "data_checkin": "2026-06-10",
            "data_checkout": "2026-06-15",
            "forma_pagamento": "Pix",
            "valor_total": 500.0
        }
    )

    # 2. Tenta criar uma reserva que sobrepõe (ex: 12 a 17)
    response = client.post(
        "/api/reservas/",
        json={
            "cliente_id": 1,
            "cabana_id": 1,
            "data_checkin": "2026-06-12",
            "data_checkout": "2026-06-17",
            "forma_pagamento": "Cartão",
            "valor_total": 600.0
        }
    )
    assert response.status_code == 400
    assert "Cabana não disponível" in response.json()["detail"]
