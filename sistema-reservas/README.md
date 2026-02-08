# Sistema de Gestão de Reservas - Cabanas na Mata

Este é um sistema interno completo para gestão de reservas, clientes e disponibilidade das 3 unidades das Cabanas na Mata (Serra da Moeda, MG).

## 🚀 Tecnologias Utilizadas

### Backend
- **Python 3.12+** com **FastAPI**
- **Poetry** para gestão de dependências e ambientes virtuais
- **SQLAlchemy** (ORM) com banco de dados **SQLite**
- **Pydantic** para validação de dados e schemas

### Frontend
- **Next.js 15** com **TypeScript**
- **Tailwind CSS** para estilização (Design System "Stone")
- **TanStack Query (React Query)** para sincronização de dados
- **React Hook Form + Zod** para validação de formulários
- **Lucide React** para iconografia

---

## 🛠️ Como Executar o Projeto

### 1. Requisitos Próximos
- Python 3.12 ou superior instalado.
- Node.js 20 ou superior instalado.
- Poetry instalado (`pipx install poetry`).

### 2. Configurando o Backend
```bash
cd backend
# Instalar dependências
poetry install

# Inicializar o banco de dados e as cabanas padrão
poetry run python init_db.py

# Iniciar o servidor de desenvolvimento
poetry run uvicorn app.main:app --reload
```
A API estará disponível em `http://localhost:8000`. Você pode acessar a documentação interativa em `http://localhost:8000/docs`.

### 3. Configurando o Frontend
```bash
cd frontend
# Instalar dependências
npm install

# Iniciar o servidor de desenvolvimento
npm run dev
```
O sistema estará disponível em `http://localhost:3000`.

---

## 📂 Estrutura de Pastas
- `/backend`: API FastAPI, Modelos de dados e lógica de negócios.
- `/frontend`: Aplicação Next.js, Componentes de interface e serviços de API.
- `/plano_implementacao_reservas.md`: Checklist detalhado do desenvolvimento.

---

## 📝 Funcionalidades Principais
- **Dashboard:** Visão geral de ocupação e estatísticas.
- **Calendário Mensal:** Gestão visual de reservas por cabana (cores distintas).
- **Gestão de Clientes:** Cadastro e histórico de contato dos hóspedes.
- **Lógica de Conflito:** O sistema impede automaticamente reservas sobrepostas na mesma cabana.
- **Mensagens Internas:** Notas e registros de comunicação vinculados a cada reserva.

---
**Desenvolvido para Cabanas na Mata - 2026**
