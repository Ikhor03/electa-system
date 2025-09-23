# 🐳 Full Docker Setup - Production-Ready Environment

## 📋 Overview

Complete containerized setup for the Pemilu election system with production parity.

## 🏗️ **Architecture**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   PostgreSQL    │
│   (Next.js)     │◄──►│   (NestJS)      │◄──►│   Database      │
│   Port: 3000    │    │   Port: 3001    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │ Docker Network  │
                    │ pemilu-network  │
                    └─────────────────┘
```

## 🚀 **Quick Start**

### **Step 1: Update Your .env**
Update your `backend/.env` file:
```bash
# Database Configuration (Docker internal)
DATABASE_URL="postgresql://pemilu_user:pemilu_password@postgres:5432/pemilu"

# JWT Configuration
JWT_SECRET="your-super-secure-jwt-secret-key-minimum-32-characters-long"
JWT_REFRESH_SECRET="your-super-secure-refresh-secret-key-minimum-32-characters-long"

# Application Environment
NODE_ENV="development"
PORT="3001"

# CORS Configuration
FRONTEND_URL="http://localhost:3000"
```

### **Step 2: Start Full Stack**
```bash
# Build and start all services
docker-compose up --build

# Or run in background
docker-compose up -d --build
```

### **Step 3: Initialize Database**
```bash
# Generate Prisma client (if needed)
docker-compose exec backend pnpm db:generate

# Run database migrations
docker-compose exec backend pnpm db:migrate

# Seed the database
docker-compose exec backend pnpm db:seed
```

## 📦 **Services**

### **PostgreSQL Database**
- **Container**: `pemilu-postgres`
- **Internal Port**: `5432`
- **External Port**: `5433` (for external tools)
- **Network**: `pemilu-network`
- **Health Check**: Built-in PostgreSQL ready check

### **NestJS Backend**
- **Container**: `pemilu-backend`
- **Internal Port**: `3001`
- **External Port**: `3001`
- **Network**: `pemilu-network`
- **Dependencies**: Waits for PostgreSQL health check
- **Hot Reload**: Enabled with volume mounting

### **Next.js Frontend**
- **Container**: `pemilu-frontend`
- **Internal Port**: `3000`
- **External Port**: `3000`
- **Network**: `pemilu-network`
- **Dependencies**: Waits for backend
- **Hot Reload**: Enabled with volume mounting

## 🔧 **Development Commands**

### **Container Management**
```bash
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# Stop all services
docker-compose down

# Rebuild and start
docker-compose up --build

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### **Database Operations**
```bash
# Generate Prisma client
docker-compose exec backend pnpm db:generate

# Run migrations
docker-compose exec backend pnpm db:migrate

# Seed database
docker-compose exec backend pnpm db:seed

# Reset database
docker-compose exec backend pnpm db:reset

# Open Prisma Studio
docker-compose exec backend pnpm db:studio
```

### **Application Operations**
```bash
# Backend shell access
docker-compose exec backend sh

# Frontend shell access
docker-compose exec frontend sh

# Run backend tests
docker-compose exec backend pnpm test

# Run E2E tests
docker-compose exec backend pnpm test:e2e

# Build backend
docker-compose exec backend pnpm build

# Build frontend
docker-compose exec frontend pnpm build
```

## 🌐 **Access Points**

### **Development URLs**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Database**: localhost:5433 (external tools)
- **Prisma Studio**: http://localhost:5555 (when running)

### **API Endpoints**
- **Authentication**: http://localhost:3001/auth/*
- **Health Check**: http://localhost:3001/ (returns 401 - protected)
- **API Documentation**: http://localhost:3001/api (when Swagger added)

## 🔒 **Security Features**

### **Network Isolation**
- All services run in isolated `pemilu-network`
- Internal communication uses service names
- External access only through mapped ports

### **Environment Variables**
- Sensitive data in environment variables
- No hardcoded secrets in containers
- Production-ready configuration

### **Health Checks**
- PostgreSQL: Connection readiness check
- Backend: HTTP endpoint check (planned)
- Frontend: HTTP endpoint check (planned)

## 📊 **Production Benefits**

### **✅ Advantages of Full Docker Setup**
1. **Environment Parity**: Dev = Staging = Production
2. **Isolation**: Each service in its own container
3. **Scalability**: Easy to scale individual services
4. **Deployment**: Single `docker-compose up` command
5. **Consistency**: Same environment for all developers
6. **CI/CD Ready**: Easy integration with deployment pipelines

### **🔄 Development Workflow**
1. **Code Changes**: Auto-reload with volume mounting
2. **Database Changes**: Run migrations in container
3. **Testing**: Run tests in isolated environment
4. **Debugging**: Full access to container shells
5. **Deployment**: Same containers go to production

## 🚨 **Troubleshooting**

### **Common Issues**

**Port Conflicts**
```bash
# Check what's using ports
lsof -i :3000
lsof -i :3001
lsof -i :5433

# Stop conflicting services
docker-compose down
```

**Database Connection Issues**
```bash
# Check PostgreSQL health
docker-compose exec postgres pg_isready -U pemilu_user -d pemilu

# Check database logs
docker-compose logs postgres

# Reset database
docker-compose exec backend pnpm db:reset
```

**Build Issues**
```bash
# Clean rebuild
docker-compose down
docker-compose build --no-cache
docker-compose up
```

**Permission Issues**
```bash
# Fix node_modules permissions
docker-compose exec backend chown -R node:node /app/node_modules
docker-compose exec frontend chown -R node:node /app/node_modules
```

## 📈 **Performance Optimization**

### **Volume Mounting Strategy**
- **Source Code**: Mounted for hot reload
- **node_modules**: Separate volumes for performance
- **Build Artifacts**: Separate volumes to persist builds

### **Build Optimization**
- **Multi-stage builds**: Separate dev/prod stages
- **Layer caching**: Optimized Dockerfile layer order
- **Dependency caching**: pnpm lockfile for consistent installs

## 🎯 **Next Steps**

### **Phase 4 Ready**
With this Docker setup, you're ready for:
1. **Backend Core Modules**: User, Election, Voting management
2. **API Documentation**: Swagger integration
3. **Frontend Development**: React components with API integration
4. **Testing**: Full-stack E2E testing in containers
5. **Deployment**: Production-ready containerized deployment

### **Production Deployment**
This setup can be easily adapted for:
- **Docker Swarm**: Multi-node deployment
- **Kubernetes**: Container orchestration
- **Cloud Services**: AWS ECS, Google Cloud Run, etc.
- **CI/CD**: GitHub Actions, GitLab CI, etc.

---

**Status**: Production-ready Docker setup ✅  
**Environment**: Full containerization with development hot-reload  
**Ready for**: Phase 4 Backend Core Modules development
