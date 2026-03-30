# Sistema DEAM Pedro II - Diretrizes de Codificação para IA

## Visão Geral da Arquitetura
Esta é uma aplicação web full-stack para gerenciar agentes (agentes) e notificações legais (intimações) em um sistema DEAM (Delegacia Especializada no Atendimento à Mulher).

**Frontend**: React 18 + Vite + TypeScript + Tailwind CSS + Framer Motion
- Localizado no diretório raiz `src/`
- Usa React Router para navegação, React Hook Form + Zod para validação de formulários
- Chamadas de API via `src/services/api.ts` com tokens JWT Bearer do localStorage
- Paleta de cores personalizada: primary (roxo), secondary (azul), success, warning, error

**Backend**: Node.js + Express + TypeScript + Prisma (PostgreSQL)
- Localizado no diretório `backend/`
- Controladores em `backend/src/controllers/`, rotas em `backend/src/routes/`
- Tratamento de erros: Controladores chamam `next(err)`, capturado pelo middleware `errorHandler`
- Autenticação: Tokens JWT, bcrypt para senhas

**Banco de Dados**: Prisma ORM com PostgreSQL
- Esquema em `backend/prisma/schema.prisma`
- Modelos: User, Agente, Intimacao (com relações)

## Fluxos de Desenvolvimento
- **Dev frontend**: `npm run dev` (servidor dev Vite na porta 5173)
- **Dev backend**: `cd backend && npm run dev` (ts-node-dev na porta 3000)
- **Build frontend**: `npm run build`
- **Build backend**: `cd backend && npm run build` (TypeScript para `dist/`)
- **Iniciar produção**: `cd backend && npm start` (serve de `dist/server.js`)
- **Configuração do banco**: `cd backend && npx prisma migrate dev` (após mudanças no esquema)
- **Lint**: `npm run lint` (ESLint com regras TypeScript e React)

## Padrões e Convenções Principais
- **Tratamento de erros**: Controladores backend usam `next(err)`; API frontend lança em !res.ok
- **Autenticação**: Armazenar JWT no localStorage como "token"; incluir em requisições API como `Bearer ${token}`
- **Formulários**: Usar React Hook Form com esquemas Zod para validação (veja `NovaIntimacao.tsx` como exemplo)
- **Animações**: Framer Motion para transições de página e efeitos UI (ex.: sidebar em `Layout.tsx`)
- **Estilização**: Tailwind com cores personalizadas; design responsivo com abordagem mobile-first
- **Idioma**: Português para texto da UI, comentários e mensagens da API
- **Estrutura de arquivos**: 
  - Componentes frontend em `src/components/`, páginas em `src/pages/`
  - Rotas backend importam controladores, middlewares lidam com auth/erros
- **Imports**: Caminhos absolutos de `src/` ou `backend/src/`; preferir imports nomeados

## Pontos de Integração
- **URL Base da API**: `http://127.0.0.1:3000` (hardcoded em `api.ts`)
- **CORS**: Habilitado no backend para requisições frontend
- **Banco de Dados**: PostgreSQL via Prisma; string de conexão em `DATABASE_URL` var env
- **Deps externos**: Lucide React para ícones, Recharts para gráficos, React Hot Toast para notificações

## Armadilhas Comuns
- Rotas backend são desprotegidas exceto login/register; middleware auth existe mas não aplicado globalmente
- Cliente Prisma instanciado por controlador (não compartilhado); considerar singleton em `database/prisma.ts`
- Sem validação de entrada no backend além de verificações básicas; confiar no Zod frontend
- Variáveis de ambiente: `JWT_SECRET`, `DATABASE_URL`, `PORT` (apenas backend)

## Exemplos
- **Criando uma nova página**: Adicionar rota em `App.tsx`, criar componente em `src/pages/`, atualizar navegação em `Layout.tsx`
- **Adicionando endpoint API**: Criar função controlador em `backend/src/controllers/`, adicionar rota em `routes/index.ts`, adicionar método em `src/services/api.ts`
- **Mudanças no banco**: Atualizar `schema.prisma`, executar `npx prisma migrate dev`, regenerar cliente com `npx prisma generate`</content>
<parameter name="filePath">/home/samuel/Músicas/DEAMP2-WEB-OFICIAL/projeto_corrigido (Cópia) 13/.github/copilot-instructions.md