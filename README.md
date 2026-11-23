# MetaPay — Sistema de Controle Financeiro

O **MetaPay** é uma aplicação web de controle financeiro pessoal, desenvolvida para facilitar o gerenciamento de receitas, despesas e movimentações financeiras.

O sistema possui autenticação de usuários, dashboard financeiro, gráficos, relatórios, cadastro de transações e armazenamento de dados em PostgreSQL.

Projeto desenvolvido como atividade acadêmica da disciplina de Desenvolvimento de Sistemas.

## 1. Tecnologias utilizadas

**Frontend**
- React
- TypeScript
- Vite
- Tailwind CSS
- Recharts
- Lucide React

**Backend**
- Node.js
- Express
- PostgreSQL
- JWT (JSON Web Token)
- bcryptjs
- Swagger / OpenAPI

**Hospedagem**
- GitHub — Código-fonte
- Netlify — Frontend
- Render — Backend e PostgreSQL

## 2. Links do projeto

**Aplicação publicada:**  
https://cardpaysenai.netlify.app

**Repositório GitHub:**  
https://github.com/kauasrocha-ai/MetaPay

**API publicada:**  
https://metapay-backend.onrender.com

**Documentação Swagger:**  
https://metapay-backend.onrender.com/api/docs

**Verificação da API:**  
https://metapay-backend.onrender.com/api/health

## 3. Funcionalidades

- Cadastro de usuários.
- Login com autenticação JWT.
- Senhas armazenadas com hash bcrypt.
- Controle de acesso por perfil.
- Cadastro de receitas e despesas.
- Consulta do histórico de transações.
- Atualização de transações existentes.
- Busca por descrição e categoria.
- Filtros e paginação na interface.
- Dashboard com resumo financeiro.
- Gráficos de gastos por categoria.
- Relatórios de movimentações.
- Interface responsiva.
- Documentação interativa da API.

## 4. Requisitos funcionais

**RF01:** Permitir cadastro de usuários.

**RF02:** Permitir autenticação por e-mail e senha.

**RF03:** Permitir consultar informações do usuário autenticado.

**RF04:** Permitir registrar receitas e despesas.

**RF05:** Permitir consultar e atualizar transações.

**RF06:** Exibir informações financeiras no dashboard.

**RF07:** Permitir pesquisar e filtrar transações.

**RF08:** Exibir gráficos e relatórios financeiros.

**RF09:** Restringir endpoints administrativos por perfil.

**RF10:** Disponibilizar documentação dos endpoints.

## 5. Requisitos não funcionais

**RNF01 — Segurança:** utilizar autenticação JWT e armazenamento seguro de senhas.

**RNF02 — Persistência:** utilizar PostgreSQL para armazenar usuários e transações.

**RNF03 — Usabilidade:** disponibilizar uma interface intuitiva.

**RNF04 — Responsividade:** adaptar a apresentação para diferentes tamanhos de tela.

**RNF05 — Manutenibilidade:** separar frontend, backend e banco de dados.

**RNF06 — Documentação:** disponibilizar instruções de instalação e documentação Swagger.

**RNF07 — Desempenho:** utilizar índices e organizar consultas para facilitar futuras otimizações.

**RNF08 — Integridade:** validar dados recebidos pela API e utilizar consultas SQL parametrizadas.

## 6. Arquitetura do sistema

A arquitetura do MetaPay é composta por três camadas:

**Frontend (React + Vite)**

Responsável pelas telas, formulários, navegação e visualização dos gráficos.

**Backend (Node.js + Express)**

Responsável por processar as requisições HTTP, realizar autenticação, validar informações e acessar o banco de dados.

**Banco de dados (PostgreSQL)**

Responsável pelo armazenamento persistente de usuários e transações.

**Fluxo de comunicação:**

Usuário → Frontend React → API Express → PostgreSQL

O frontend está hospedado no Netlify, enquanto o backend e o banco de dados estão hospedados no Render.

## 7. Estrutura do projeto

- `src/` — Código principal do frontend React.
- `src/App.tsx` — Interface e funcionalidades principais.
- `src/index.css` — Estilos da aplicação.
- `components/` — Componentes reutilizáveis.
- `lib/` — Funções auxiliares.
- `backend/server.js` — Servidor Express e rotas.
- `backend/db.js` — Conexão PostgreSQL.
- `backend/auth.js` — Middleware JWT e autorização.
- `backend/transacoes.js` — Rotas de transações.
- `backend/financeiro.js` — Cálculos financeiros.
- `backend/swagger.js` — Documentação OpenAPI.
- `backend/sql.sql` — Estrutura do banco e índices.
- `backend/docker-compose.yml` — PostgreSQL local.
- `backend/tests/` — Testes automatizados.

## 8. Rotas da API

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/api/health` | Verificar API e banco |
| POST | `/api/auth/register` | Cadastrar usuário |
| POST | `/api/auth/login` | Realizar login |
| GET | `/api/auth/me` | Consultar perfil autenticado |
| GET | `/api/admin/check` | Verificar acesso administrativo |
| GET | `/api/transacoes` | Listar transações |
| POST | `/api/transacoes` | Cadastrar transação |
| PUT | `/api/transacoes/:id` | Atualizar transação |
| GET | `/api/dashboard/resumo` | Consultar resumo financeiro |

As rotas protegidas exigem autenticação com token JWT.

## 9. Segurança e controle de acesso

O MetaPay utiliza:

- Autenticação JWT com prazo de expiração.
- Hash de senhas com bcrypt.
- Middleware de verificação de tokens.
- Controle de perfil `usuario` e `admin`.
- Consultas SQL parametrizadas.
- Isolamento dos dados por usuário nas rotas de transações.
- Variáveis de ambiente para configurações sensíveis.

**RBAC (Role-Based Access Control):**

- **Usuário:** acessa suas informações e transações.
- **Administrador:** possui permissão adicional para acessar o endpoint administrativo.

A aplicação demonstra controle de acesso, mas ainda requer validações adicionais para uma utilização pública em produção.

## 10. Banco de dados

O PostgreSQL possui as tabelas:

**usuarios**
- ID
- Nome
- E-mail
- Hash da senha
- Perfil
- Data de criação

**transacoes**
- ID
- ID do usuário
- Descrição
- Categoria
- Tipo
- Valor
- Data da transação

Foram criados índices para auxiliar consultas por usuário, data e categoria.

O arquivo `backend/sql.sql` contém as instruções para criar a estrutura necessária.

## 11. Executando localmente

**Pré-requisitos:**
- Node.js
- npm
- Docker Desktop
- Git

**Frontend:**

Na pasta principal, instale as dependências com `npm install`.

Inicie com:

`npm run dev -- --port 5173`

Acesse:

http://localhost:5173

**Banco de dados:**

Na pasta `backend`, configure o arquivo `.env` de acordo com o ambiente local e execute:

`docker compose up -d`

**Backend:**

Na pasta `backend`, execute:

`npm install`

Depois:

`npm run dev`

A API local ficará disponível em:

http://localhost:3002

**Variáveis de ambiente do backend:**

- `PORT`
- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `JWT_SECRET`

Para desenvolvimento local, o frontend utiliza `http://localhost:3002` como endereço padrão da API.

Na hospedagem Netlify, a variável `VITE_API