# Pemilu Election System

A modern election management system built with NestJS and Next.js, migrated from PHP CodeIgniter.

## 🏗️ Architecture

- **Backend**: NestJS + TypeScript + Prisma + PostgreSQL
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS + TanStack Query
- **Database**: PostgreSQL with Docker
- **Authentication**: Custom JWT with refresh tokens
- **Monorepo**: pnpm workspaces

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm
- Docker & Docker Compose

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd pemilu-nextjs
   pnpm install
   ```

2. **Setup environment variables:**
   ```bash
   # Backend
   cp backend/.env.example backend/.env
   # Edit backend/.env with your configuration
   ```

3. **Start PostgreSQL database:**
   ```bash
   docker-compose up -d postgres
   ```

4. **Setup database:**
   ```bash
   pnpm --filter backend db:migrate
   pnpm --filter backend db:seed
   ```

5. **Start development servers:**
   ```bash
   pnpm dev
   ```

   This will start:
   - Backend API: http://localhost:3001
   - Frontend: http://localhost:3000

## 📁 Project Structure

```
pemilu-nextjs/
├── backend/                 # NestJS API server
│   ├── src/
│   ├── prisma/
│   └── package.json
├── frontend/                # Next.js web application
│   ├── src/
│   └── package.json
├── shared/                  # Shared types and interfaces
│   ├── src/
│   └── package.json
├── docker-compose.yml       # PostgreSQL database
└── package.json            # Root workspace configuration
```

## 🛠️ Development

### Available Scripts

**Root level:**
- `pnpm dev` - Start both backend and frontend in development mode
- `pnpm build` - Build both applications
- `pnpm test` - Run all tests
- `pnpm lint` - Lint all packages

**Backend:**
- `pnpm --filter backend dev` - Start backend development server
- `pnpm --filter backend db:migrate` - Run database migrations
- `pnpm --filter backend db:seed` - Seed database with sample data
- `pnpm --filter backend db:studio` - Open Prisma Studio

**Frontend:**
- `pnpm --filter frontend dev` - Start frontend development server
- `pnpm --filter frontend build` - Build frontend for production

### Database Management

- **Migrations**: `pnpm --filter backend db:migrate`
- **Reset**: `pnpm --filter backend db:reset`
- **Studio**: `pnpm --filter backend db:studio`

## 🔧 Configuration

### Environment Variables

**Backend (.env):**
```env
DATABASE_URL="postgresql://pemilu_user:pemilu_password@localhost:5432/pemilu"
JWT_SECRET="your-jwt-secret"
JWT_REFRESH_SECRET="your-refresh-secret"
NODE_ENV="development"
PORT="3001"
FRONTEND_URL="http://localhost:3000"
```

## 🧪 Testing

- **Unit Tests**: `pnpm test`
- **E2E Tests**: `pnpm --filter backend test:e2e`
- **Coverage**: `pnpm --filter backend test:cov`

## 📚 API Documentation

Once the backend is running, visit:
- Swagger UI: http://localhost:3001/api
- API JSON: http://localhost:3001/api-json

## 🚢 Deployment

### Docker Production Build

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Start production services
docker-compose -f docker-compose.prod.yml up -d
```

## 🔐 Security Features

- JWT authentication with refresh tokens
- Password hashing with bcrypt
- Input validation with class-validator
- CORS protection
- Rate limiting
- SQL injection prevention with Prisma

## 📋 Migration from PHP

This project migrates from a PHP CodeIgniter application with the following improvements:

- **Modern Stack**: TypeScript, NestJS, Next.js
- **Better Security**: JWT tokens, bcrypt hashing
- **Type Safety**: Full TypeScript implementation
- **Modern UI**: Tailwind CSS, responsive design
- **Better Performance**: Optimized queries, caching
- **Developer Experience**: Hot reload, type checking, linting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
