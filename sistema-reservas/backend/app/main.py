from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import os
import json
from .routers import clientes, reservas, mensagens, cabanas, auth, usuarios, calendar, public
from .database import engine, Base
from init_db import init_db

# Inicializa o banco de dados e cria o usuário admin se necessário
try:
    init_db()
except Exception as e:
    print(f"Erro ao inicializar banco: {e}")

# Configuração do Rate Limiter
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="Sistema de Reservas - Cabanas na Mata",
    description="API para gestão interna de reservas, clientes e disponibilidade.",
    version="1.0.0"
)

# Adiciona o limiter ao state do app
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Configuração de GZip
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Configuração de CORS Dinâmico
# Em produção, defina BACKEND_CORS_ORIGINS no .env como uma lista JSON de strings
# Ex: BACKEND_CORS_ORIGINS='["https://meuapp.com", "https://outro.com"]'
# Se não estiver definido, usa uma lista padrão segura (ou a lista de desenvolvimento)
default_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
]

env_origins = os.getenv("BACKEND_CORS_ORIGINS")
if env_origins:
    try:
        origins = json.loads(env_origins)
    except json.JSONDecodeError:
        print("Erro ao decodificar BACKEND_CORS_ORIGINS. Usando padrão.")
        origins = default_origins
else:
    # Fallback para URLs antigas/manuais se necessário, ou apenas default
    origins = default_origins + [
        "https://c61e3a760d637955-216-234-209-114.serveousercontent.com",
        "https://7a66ca5f5bf0ad88-216-234-209-114.serveousercontent.com",
        "https://c7df180e4b3eaae0-216-234-209-114.serveousercontent.com",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusão dos Routers (DEPOIS de definir o app)
app.include_router(auth.router)
app.include_router(usuarios.router)
app.include_router(mensagens.router) # Mover para cima por precaução
app.include_router(clientes.router)
app.include_router(reservas.router)
app.include_router(cabanas.router)
app.include_router(calendar.router)
app.include_router(public.router)

@app.get("/")
def read_root():
    return {"status": "API Online", "projeto": "Cabanas na Mata"}