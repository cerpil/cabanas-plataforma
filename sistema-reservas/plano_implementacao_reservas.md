# Plano de Implementação - Sistema de Gestão de Reservas de Cabanas

## 📋 Informações do Projeto

- **Stack**: Python 3.12, FastAPI, SQLite, Next.js, React, Tailwind CSS
- **Objetivo**: Sistema interno de gestão de reservas para 3 cabanas
- **Tipo**: Aplicação web com calendário interativo

---

## 🎯 Fase 1: Configuração do Ambiente e Estrutura do Projeto

### 1.1 Configuração do Backend
- [x] Criar diretório do projeto `cabanas-reservas`
- [x] Criar ambiente virtual Python (`python -m venv venv`)
- [x] Ativar ambiente virtual
- [x] Criar arquivo `requirements.txt` com dependências:
  - [x] FastAPI
  - [x] Uvicorn
  - [x] SQLAlchemy
  - [x] Pydantic
  - [x] Python-dotenv
  - [x] CORS middleware
- [x] Instalar dependências (`pip install -r requirements.txt`)
- [x] Criar estrutura de pastas do backend:
  ```
  backend/
  ├── app/
  │   ├── __init__.py
  │   ├── main.py
  │   ├── database.py
  │   ├── models/
  │   ├── schemas/
  │   ├── routers/
  │   └── utils/
  └── requirements.txt
  ```

### 1.2 Configuração do Frontend
- [x] Criar projeto Next.js com TypeScript (`npx create-next-app@latest frontend`)
- [x] Configurar Tailwind CSS (já incluso no setup do Next.js)
- [x] Instalar dependências adicionais:
  - [x] Axios ou Fetch API
  - [x] React Query (TanStack Query)
  - [x] React Calendar ou FullCalendar
  - [x] Date-fns ou Day.js
  - [x] React Hook Form
  - [x] Zod (validação)
- [x] Criar estrutura de pastas do frontend:
  ```
  frontend/
  ├── src/
  │   ├── app/
  │   ├── components/
  │   ├── services/
  │   ├── types/
  │   ├── hooks/
  │   └── utils/
  └── package.json
  ```

---

## 🗄️ Fase 2: Modelagem e Configuração do Banco de Dados

### 2.1 Definição dos Modelos SQLAlchemy
- [x] Criar modelo `Cliente`:
  - [x] id (Integer, Primary Key)
  - [x] nome (String, obrigatório)
  - [x] telefone (String, obrigatório)
  - [x] email (String, opcional)
  - [x] created_at (DateTime)
  - [x] updated_at (DateTime)

- [x] Criar modelo `Cabana`:
  - [x] id (Integer, Primary Key)
  - [x] nome (String)
  - [x] numero (Integer, único)
  - [x] descricao (String, opcional)
  - [x] capacidade (Integer)

- [x] Criar modelo `Reserva`:
  - [x] id (Integer, Primary Key)
  - [x] cliente_id (Foreign Key → Cliente)
  - [x] cabana_id (Foreign Key → Cabana)
  - [x] data_checkin (Date, obrigatório)
  - [x] data_checkout (Date, obrigatório)
  - [x] forma_pagamento (String: dinheiro, pix, cartão, etc.)
  - [x] valor_total (Float)
  - [x] status (String: confirmada, pendente, cancelada, concluída)
  - [x] observacoes (Text, opcional)
  - [x] created_at (DateTime)
  - [x] updated_at (DateTime)

- [x] Criar modelo `Mensagem`:
  - [x] id (Integer, Primary Key)
  - [x] reserva_id (Foreign Key → Reserva)
  - [x] remetente (String: cliente ou sistema)
  - [x] conteudo (Text)
  - [x] created_at (DateTime)
  - [x] lida (Boolean, default=False)

### 2.2 Configuração do Banco de Dados
- [x] Criar arquivo `database.py` com configuração SQLite
- [x] Configurar SessionLocal e Base
- [x] Criar função `get_db()` para dependency injection
- [x] Criar script de inicialização do banco
- [x] Popular tabela de Cabanas com as 3 cabanas iniciais

---

## 🔧 Fase 3: Desenvolvimento da API Backend

### 3.1 Schemas Pydantic
- [x] Criar schemas para Cliente:
  - [x] ClienteCreate
  - [x] ClienteUpdate
  - [x] ClienteResponse
- [x] Criar schemas para Reserva:
  - [x] ReservaCreate
  - [x] ReservaUpdate
  - [x] ReservaResponse (com relacionamentos)
- [x] Criar schemas para Mensagem:
  - [x] MensagemCreate
  - [x] MensagemResponse
- [x] Criar schemas para Cabana:
  - [x] CabanaResponse

### 3.2 CRUD - Clientes
- [x] Criar router `clientes.py`
- [x] Implementar endpoint `POST /api/clientes` (criar cliente)
- [x] Implementar endpoint `GET /api/clientes` (listar todos)
- [x] Implementar endpoint `GET /api/clientes/{id}` (buscar por ID)
- [x] Implementar endpoint `PUT /api/clientes/{id}` (atualizar)
- [x] Implementar endpoint `DELETE /api/clientes/{id}` (deletar)
- [x] Adicionar validações e tratamento de erros

### 3.3 CRUD - Reservas
- [x] Criar router `reservas.py`
- [x] Implementar endpoint `POST /api/reservas` (criar reserva)
  - [x] Validar disponibilidade da cabana nas datas
  - [x] Verificar conflitos de reservas
- [x] Implementar endpoint `GET /api/reservas` (listar todas)
  - [x] Adicionar filtros: data, cabana_id, status
  - [x] Incluir dados do cliente e cabana
- [x] Implementar endpoint `GET /api/reservas/{id}` (buscar por ID)
  - [x] Incluir mensagens relacionadas
- [x] Implementar endpoint `PUT /api/reservas/{id}` (atualizar)
- [x] Implementar endpoint `DELETE /api/reservas/{id}` (cancelar reserva)
- [x] Implementar endpoint `GET /api/reservas/calendario` (dados para calendário)
  - [x] Retornar reservas agrupadas por data
  - [x] Incluir informações essenciais para visualização

### 3.4 CRUD - Mensagens
- [x] Criar router `mensagens.py`
- [x] Implementar endpoint `POST /api/mensagens` (criar mensagem)
- [x] Implementar endpoint `GET /api/reservas/{reserva_id}/mensagens` (listar por reserva)
- [x] Implementar endpoint `PUT /api/mensagens/{id}/marcar-lida` (marcar como lida)
- [x] Implementar endpoint `DELETE /api/mensagens/{id}` (deletar mensagem)

### 3.5 Endpoints Auxiliares
- [x] Implementar `GET /api/cabanas` (listar cabanas)
- [x] Implementar `GET /api/cabanas/{id}/disponibilidade` (verificar disponibilidade)
- [x] Implementar endpoint de estatísticas (dashboard)
- [x] Configurar CORS para aceitar requisições do frontend

### 3.6 Configuração e Testes da API
- [x] Configurar `main.py` com todos os routers
- [x] Testar todos os endpoints com Thunder Client/Postman/cURL
- [x] Documentar endpoints (Swagger automático do FastAPI)
- [x] Criar arquivo `.env` para configurações

---

## 🎨 Fase 4: Desenvolvimento do Frontend

### 4.1 Configuração de Serviços e API
- [x] Criar arquivo `services/api.ts` com configuração do Axios
- [x] Criar interfaces TypeScript para:
  - [x] Cliente
  - [x] Reserva
  - [x] Mensagem
  - [x] Cabana
- [x] Criar funções de API para cada recurso:
  - [x] clientesAPI (CRUD completo)
  - [x] reservasAPI (CRUD completo)
  - [x] mensagensAPI
  - [x] cabanasAPI

### 4.2 Componentes Base
- [x] Criar componente `Layout` (navegação e estrutura)
- [x] Criar componente `Header` (cabeçalho da aplicação)
- [x] Criar componente `Sidebar` (menu lateral)
- [x] Criar componente `Button` (botão reutilizável)
- [x] Criar componente `Input` (input reutilizável)
- [x] Criar componente `Modal` (generic modal)
- [x] Criar componente `Card` (card reutilizável)
- [x] Criar componente `Loading` (indicador de carregamento)

### 4.3 Página Principal - Calendário
- [x] Criar página `/app/page.tsx` (dashboard principal)
- [x] Criar componente `Calendar`:
  - [x] Visualização mensal das reservas
  - [x] Cores diferentes para cada cabana
  - [x] Hover mostrando detalhes resumidos
  - [x] Click abrindo modal com detalhes completos
- [x] Criar componente `CalendarDay`:
  - [x] Renderizar reservas do dia
  - [x] Indicador visual de ocupação
- [x] Criar componente `ReservaCard`:
  - [x] Exibir informações da reserva
  - [x] Ícones para cabana, cliente, pagamento
  - [x] Badge de status
- [x] Implementar filtros:
  - [x] Por cabana
  - [x] Por período
  - [x] Por status
- [x] Adicionar navegação entre meses

### 4.4 Modal de Detalhes da Reserva
- [x] Criar componente `ReservaDetalhesModal`:
  - [x] Exibir dados completos da reserva
  - [x] Informações do cliente (nome, telefone, email)
  - [x] Datas de check-in e check-out
  - [x] Forma de pagamento e valor
  - [x] Status da reserva
  - [x] Botões de ação (editar, cancelar)
- [x] Criar seção de mensagens dentro do modal:
  - [x] Lista de mensagens trocadas
  - [x] Input para nova mensagem
  - [x] Indicador de mensagens não lidas
  - [x] Scroll automático para última mensagem
- [x] Implementar ações:
  - [x] Editar reserva (abrir formulário)
  - [x] Cancelar reserva (com confirmação)
  - [x] Enviar mensagem

### 4.5 Formulários
- [x] Criar componente `NovaReservaForm`:
  - [x] Seleção de cliente (busca/criar novo)
  - [x] Seleção de cabana
  - [x] Seleção de datas (com validação de disponibilidade)
  - [x] Forma de pagamento
  - [x] Valor total
  - [x] Observações
  - [x] Validação de formulário com Zod
  - [x] Feedback visual de erros
- [x] Criar componente `ClienteForm`:
  - [x] Campos: nome, telefone, email
  - [x] Validação de dados
  - [x] Pode ser usado para criar/editar
- [x] Criar componente `EditarReservaForm`:
  - [x] Similar ao NovaReservaForm
  - [x] Pré-preenchido com dados existentes
  - [x] Validação de conflitos ao alterar datas

### 4.6 Páginas Adicionais
- [x] Criar página `/clientes` (listagem de clientes):
  - [x] Tabela com todos os clientes
  - [x] Busca e filtros
  - [x] Ações: visualizar, editar, deletar
- [x] Criar reserva `/reservas` (listagem completa):
  - [x] Tabela com todas as reservas
  - [x] Filtros avançados
  - [x] Exportação de dados (opcional)
- [x] Criar página `/cabanas` (informações das cabanas):
  - [x] Cards com informações de cada cabana
  - [x] Taxa de ocupação
  - [x] Próximas reservas

### 4.7 Funcionalidades Avançadas do Calendário
- [ ] Implementar drag-and-drop para reagendar (opcional)
- [ ] Adicionar botão "Nova Reserva" em cada dia do calendário
- [ ] Mostrar indicador de conflito ao criar/editar reserva
- [ ] Adicionar visualização de lista (alternativa ao calendário)
- [ ] Implementar busca rápida de reservas
- [ ] Adicionar legenda de cores para status

---

## 🎨 Fase 5: Estilização e UX

### 5.1 Design System com Tailwind
- [x] Definir paleta de cores:
  - [x] Cor primária para cada cabana
  - [x] Cores de status (confirmada, pendente, cancelada)
  - [x] Cores de fundo e texto
- [x] Criar arquivo `tailwind.config.js` customizado
- [x] Definir classes utilitárias customizadas
- [x] Criar variáveis CSS para temas

### 5.2 Responsividade
- [x] Testar layout em desktop (1920px, 1366px)
- [x] Testar layout em tablet (768px)
- [x] Testar layout em mobile (375px)
- [x] Ajustar calendário para mobile:
  - [x] Visualização de semana ou lista
  - [x] Menu hambúrguer

### 5.3 Melhorias de UX
- [x] Adicionar transições suaves (hover, modal)
- [x] Implementar toasts para feedback de ações
- [x] Adicionar confirmações para ações destrutivas
- [x] Melhorar estados de loading
- [x] Adicionar skeleton screens
- [x] Implementar debounce em buscas
- [x] Adicionar indicadores de campos obrigatórios

---

## ✅ Fase 6: Validações e Regras de Negócio

### 6.1 Validações Backend
- [x] Validar datas: check-out deve ser após check-in
- [x] Validar disponibilidade da cabana:
  - [x] Não permitir reservas sobrepostas
  - [x] Considerar período de limpeza entre reservas (opcional)
- [x] Validar formato de telefone e email
- [x] Validar forma de pagamento (enum)
- [x] Validar valor total (não negativo)
- [x] Retornar mensagens de erro claras

### 6.2 Validações Frontend
- [x] Validar formulários com Zod antes de enviar
- [x] Mostrar preview de conflitos antes de salvar
- [x] Validar datas selecionadas no calendário
- [x] Bloquear seleção de datas no passado (criar reserva)
- [x] Limitar quantidade de caracteres em mensagens
- [x] Validar formato de email e telefone em tempo real

### 6.3 Tratamento de Erros
- [x] Criar interceptor de erros no Axios
- [x] Exibir mensagens de erro amigáveis
- [x] Implementar retry automático para falhas de rede
- [x] Logar erros no console (desenvolvimento)
- [x] Adicionar fallback para quando API estiver offline

---

## 🧪 Fase 7: Testes e Qualidade

### 7.1 Testes Backend
- [x] Testar criação de reserva com sucesso
- [x] Testar criação de reserva com conflito
- [x] Testar atualização de reserva
- [x] Testar deleção/cancelamento
- [x] Testar listagem com filtros
- [x] Testar CRUD de clientes
- [x] Testar sistema de mensagens
- [x] Testar validações de dados

### 7.2 Testes Frontend
- [x] Testar fluxo completo de criação de reserva
- [x] Testar navegação entre meses no calendário
- [x] Testar filtros e buscas
- [x] Testar envio de mensagens
- [x] Testar edição e cancelamento
- [x] Testar responsividade em diferentes dispositivos
- [x] Testar com diferentes tamanhos de dados

### 7.3 Testes de Integração
- [x] Testar comunicação frontend-backend completa
- [x] Testar fluxo de usuário end-to-end
- [x] Verificar sincronização de dados
- [x] Testar cenários de erro

---

## 🚀 Fase 8: Otimização e Performance

### 8.1 Backend
- [x] Adicionar índices no banco de dados:
  - [x] Índice em `reserva.data_checkin`
  - [x] Índice em `reserva.cabana_id`
  - [x] Índice em `cliente.telefone`
- [x] Implementar paginação em listagens
- [x] Otimizar queries com eager loading
- [x] Adicionar cache para dados estáticos (cabanas)

### 8.2 Frontend
- [x] Implementar React Query para cache de dados
- [x] Usar lazy loading para componentes pesados
- [x] Otimizar re-renders com React.memo
- [x] Comprimir imagens (se houver)
- [x] Implementar virtualização para listas longas
- [x] Adicionar Service Worker para cache (opcional)

---

## 📦 Fase 9: Preparação para Produção

### 9.1 Backend
- [x] Criar arquivo `.env.example` com variáveis necessárias
- [x] Configurar variáveis de ambiente para produção
- [x] Adicionar logs estruturados
- [x] Configurar CORS adequadamente
- [x] Criar script de backup do banco de dados
- [x] Documentar endpoints da API
- [x] Criar README.md do backend

### 9.2 Frontend
- [x] Otimizar build de produção
- [x] Configurar variáveis de ambiente (API URL)
- [x] Testar build de produção localmente
- [x] Adicionar meta tags para SEO (opcional)
- [x] Criar README.md do frontend
- [x] Configurar arquivo `next.config.js` para produção

### 9.3 Deployment
- [x] Escolher servidor/hospedagem:
  - [x] Backend: Railway, Render, DigitalOcean, VPS
  - [x] Frontend: Vercel, Netlify, Railway
- [x] Configurar CI/CD (opcional)
- [x] Fazer deploy do backend
- [x] Fazer deploy do frontend
- [x] Configurar domínio (opcional)
- [x] Testar aplicação em produção
- [x] Criar rotina de backup automático

---

## 📚 Fase 10: Documentação e Treinamento

### 10.1 Documentação Técnica
- [x] Documentar arquitetura do sistema
- [x] Documentar modelos de dados (diagramas ER)
- [x] Documentar fluxos principais
- [x] Criar guia de instalação e configuração
- [x] Documentar variáveis de ambiente
- [x] Criar troubleshooting guide

### 10.2 Documentação de Uso
- [x] Criar manual do usuário:
  - [x] Como criar uma reserva
  - [x] Como visualizar reservas no calendário
  - [x] Como enviar mensagens
  - [x] Como gerenciar clientes
  - [x] Como cancelar/editar reservas
- [x] Criar vídeo tutorial (opcional)
- [x] Documentar casos de uso comuns

---

## 🔄 Fase 11: Melhorias Futuras (Backlog)

### Funcionalidades Implementadas
- [x] Sistema de autenticação (JWT)
- [x] Exportação de dados (Excel, PDF)
- [x] Integração com WhatsApp
- [x] Painel de relatórios e estatísticas
- [x] Sistema de preços dinâmicos
- [x] Múltiplos usuários/funcionários
- [x] Galeria de fotos das cabanas
- [x] Check-in/Check-out digital
- [x] Avaliações e feedback dos clientes
- [x] Modo escuro (dark mode)
- [x] Gestão financeira (Sinal/Saldo)
- [x] Suporte a App Mobile (PWA)
- [x] Notificações por email/SMS

### Funcionalidades Opcionais
- [ ] Integração com sistemas de pagamento (Gateways)
- [ ] Multi-idioma

---

## 📊 Métricas de Acompanhamento

### Progresso Geral
- **Fase 1**: ☐ 0/12 tarefas concluídas
- **Fase 2**: ☐ 0/20 tarefas concluídas
- **Fase 3**: ☐ 0/33 tarefas concluídas
- **Fase 4**: ☐ 0/61 tarefas concluídas
- **Fase 5**: ☐ 0/18 tarefas concluídas
- **Fase 6**: ☐ 0/17 tarefas concluídas
- **Fase 7**: ☐ 0/20 tarefas concluídas
- **Fase 8**: ☐ 0/11 tarefas concluídas
- **Fase 9**: ☐ 0/19 tarefas concluídas
- **Fase 10**: ☐ 0/12 tarefas concluídas

**Total**: 0/223 tarefas concluídas (0%)

---

## 🎯 Cronograma Estimado

| Fase | Descrição | Tempo Estimado |
|------|-----------|----------------|
| 1 | Configuração do Ambiente | 2-3 horas |
| 2 | Modelagem do Banco de Dados | 3-4 horas |
| 3 | Desenvolvimento da API | 12-16 horas |
| 4 | Desenvolvimento do Frontend | 20-28 horas |
| 5 | Estilização e UX | 6-8 horas |
| 6 | Validações e Regras de Negócio | 4-6 horas |
| 7 | Testes e Qualidade | 6-8 horas |
| 8 | Otimização e Performance | 3-4 horas |
| 9 | Preparação para Produção | 4-6 horas |
| 10 | Documentação | 4-6 horas |

**Tempo Total Estimado**: 64-89 horas (~2-3 semanas de desenvolvimento)

---

## 📝 Notas Importantes

1. **Priorização**: As fases devem ser executadas sequencialmente para garantir uma base sólida
2. **Flexibilidade**: Ajuste o plano conforme necessário durante o desenvolvimento
3. **Testes Contínuos**: Teste cada funcionalidade assim que implementada
4. **Commits Frequentes**: Faça commits regulares no Git para controle de versão
5. **Backup**: Mantenha backups regulares do banco de dados
6. **Feedback**: Teste com usuários reais após a Fase 7

---

## ✅ Checklist de Início

Antes de começar o desenvolvimento:
- [ ] Definir requisitos detalhados
- [ ] Escolher IDE/editor de código
- [ ] Instalar Python 3.12
- [ ] Instalar Node.js e npm
- [ ] Configurar Git e criar repositório
- [ ] Definir naming conventions
- [ ] Preparar ambiente de desenvolvimento

---

**Última atualização**: Janeiro 2026
**Versão do documento**: 1.0
