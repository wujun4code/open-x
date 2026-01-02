# Open X

A modern, full-stack social media platform inspired by Twitter/X, built with cutting-edge technologies.

## 🚀 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **React 18** - UI library
- **TypeScript** - Type safety
- **Apollo Client** - GraphQL client
- **TailwindCSS** - Utility-first CSS framework

### Backend
- **Apollo Server** - GraphQL server
- **Express** - Node.js web framework
- **Prisma** - Next-generation ORM
- **PostgreSQL** - Relational database
- **JWT** - Authentication
- **bcrypt** - Password hashing

## 📁 Project Structure

```
open-x/
├── frontend/          # Next.js frontend application
│   ├── src/
│   │   ├── app/      # Next.js App Router pages
│   │   └── lib/      # Utilities and configurations
│   └── package.json
├── backend/           # Apollo GraphQL backend
│   ├── src/
│   │   ├── schema/   # GraphQL schema and resolvers
│   │   ├── context.ts
│   │   └── index.ts
│   ├── prisma/       # Database schema
│   └── package.json
└── package.json       # Root workspace configuration
```

## 🛠️ Local Development Guide

### Prerequisites

- **Node.js** 18+ and npm 9+
- **Docker & Docker Compose** (recommended for PostgreSQL)
  - [Install Docker Desktop](https://www.docker.com/products/docker-desktop/) for Windows/Mac
  - OR **PostgreSQL** 14+ installed locally

### Quick Start with Docker (Recommended)

The easiest way to get started is using Docker Compose for PostgreSQL.

> 📘 **For detailed Docker documentation, see [DOCKER.md](DOCKER.md)**


1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd open-x
   ```

2. **Start PostgreSQL with Docker Compose**
   ```bash
   docker-compose up -d
   ```
   
   This will:
   - Pull PostgreSQL 16 Alpine image
   - Start PostgreSQL on port 5432
   - Create a database named `openx`
   - Set up persistent storage for data
   
   **Verify PostgreSQL is running:**
   ```bash
   docker-compose ps
   ```
   
   You should see `openx-postgres` with status "Up" and healthy.

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Set up the database**
   ```bash
   cd backend
   npx prisma generate
   npx prisma migrate dev --name init
   cd ..
   ```
   
   This will:
   - Generate Prisma Client
   - Create database tables
   - Apply all migrations

5. **Start development servers**
   ```bash
   npm run dev
   ```
   
   This starts both frontend and backend:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:4000/graphql

6. **Verify everything works**
   - Open http://localhost:3000
   - You should see the GraphQL API status showing "✅ Connected"

### Alternative: Local PostgreSQL Setup

If you prefer to use a local PostgreSQL installation:

1. **Install PostgreSQL** (if not already installed)
   - Windows: Download from [postgresql.org](https://www.postgresql.org/download/windows/)
   - Mac: `brew install postgresql@16`
   - Linux: `sudo apt-get install postgresql-16`

2. **Create database**
   ```bash
   createdb openx
   ```

3. **Configure environment variables**
   
   Copy `.env.example` and create backend `.env`:
   ```bash
   cp .env.example backend/.env
   ```
   
   Update `backend/.env` with your database credentials:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/openx?schema=public"
   PORT=4000
   JWT_SECRET="your-secret-key"
   ```

4. **Continue from step 3** in the Docker guide above

### Docker Commands Reference

```bash
# Start PostgreSQL
docker-compose up -d

# Stop PostgreSQL
docker-compose down

# View logs
docker-compose logs -f postgres

# Stop and remove data (⚠️ destructive)
docker-compose down -v

# Restart PostgreSQL
docker-compose restart

# Access PostgreSQL CLI
docker-compose exec postgres psql -U postgres -d openx
```

### Database Management

**Prisma Studio** - Visual database browser:
```bash
cd backend
npx prisma studio
```
Opens at http://localhost:5555

**Reset database** (⚠️ deletes all data):
```bash
cd backend
npx prisma migrate reset
```

**Create new migration**:
```bash
cd backend
npx prisma migrate dev --name your_migration_name
```

### Troubleshooting

**Port 5432 already in use:**
```bash
# Check what's using the port
netstat -ano | findstr :5432  # Windows
lsof -i :5432                 # Mac/Linux

# Option 1: Stop the conflicting service
# Option 2: Change port in docker-compose.yml to "5433:5432"
```

**Database connection refused:**
```bash
# Check if PostgreSQL container is running
docker-compose ps

# Check container logs
docker-compose logs postgres

# Restart the container
docker-compose restart postgres
```

**Prisma Client errors:**
```bash
# Regenerate Prisma Client
cd backend
npx prisma generate
```

**Frontend won't start:**
```bash
# Clear Next.js cache
cd frontend
rm -rf .next
npm run dev


## 📜 Available Scripts

### Root Level
- `npm run dev` - Start both frontend and backend in development mode
- `npm run dev:frontend` - Start only frontend
- `npm run dev:backend` - Start only backend
- `npm run build` - Build both applications
- `npm run lint` - Lint all workspaces
- `npm run format` - Format code with Prettier

### Backend
- `npm run dev --workspace=backend` - Start backend dev server
- `npm run build --workspace=backend` - Build backend
- `npm run prisma:generate --workspace=backend` - Generate Prisma Client
- `npm run prisma:migrate --workspace=backend` - Run database migrations
- `npm run prisma:studio --workspace=backend` - Open Prisma Studio

### Frontend
- `npm run dev --workspace=frontend` - Start frontend dev server
- `npm run build --workspace=frontend` - Build frontend for production

## 🎯 Features (Planned)

- [x] Project setup and infrastructure
- [ ] User authentication (register, login, JWT)
- [ ] User profiles
- [ ] Create, read, delete posts
- [ ] Like/unlike posts
- [ ] Follow/unfollow users
- [ ] Comments and replies
- [ ] Real-time notifications
- [ ] Media uploads (images, videos)
- [ ] Search functionality
- [ ] Trending topics

## 🧪 Testing the Setup

1. **Backend Health Check**
   ```bash
   curl http://localhost:4000/health
   ```

2. **GraphQL Playground**
   
   Open http://localhost:4000/graphql and run:
   ```graphql
   query {
     hello
   }
   ```

3. **Frontend**
   
   Open http://localhost:3000 and verify the page loads with API status

## 📝 Development Workflow

1. Make changes to frontend or backend code
2. Hot reload will automatically update the application
3. Run `npm run lint` before committing
4. Run `npm run format` to format code

## 🤝 Contributing

This is a learning project. Feel free to explore, modify, and extend it!

## 📄 License

MIT License - see LICENSE file for details
