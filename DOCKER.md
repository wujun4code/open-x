# Docker Setup for Open X

This directory contains Docker Compose configuration for running PostgreSQL locally.

## Quick Start

```bash
# Start PostgreSQL
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f postgres

# Stop PostgreSQL
docker-compose down
```

## Configuration

The `docker-compose.yml` file sets up:
- **PostgreSQL 16 Alpine** - Lightweight PostgreSQL image
- **Port 5432** - Standard PostgreSQL port
- **Database**: `openx`
- **User**: `postgres`
- **Password**: `postgres`
- **Persistent Volume** - Data survives container restarts

## Connection String

The default connection string for the Docker PostgreSQL instance:

```
postgresql://postgres:postgres@localhost:5432/openx?schema=public
```

This is already configured in `backend/.env` (you may need to create it from `.env.example`).

## Commands

### Start Database
```bash
docker-compose up -d
```

### Stop Database
```bash
docker-compose down
```

### Remove Database and Data (⚠️ Destructive)
```bash
docker-compose down -v
```

### Access PostgreSQL CLI
```bash
docker-compose exec postgres psql -U postgres -d openx
```

### View Logs
```bash
docker-compose logs -f postgres
```

### Restart Database
```bash
docker-compose restart postgres
```

## Troubleshooting

### Port Already in Use

If port 5432 is already in use, you can either:

1. **Stop the conflicting service**
   ```bash
   # Windows
   netstat -ano | findstr :5432
   
   # Mac/Linux
   lsof -i :5432
   ```

2. **Change the port** in `docker-compose.yml`:
   ```yaml
   ports:
     - "5433:5432"  # Use 5433 on host, 5432 in container
   ```
   
   Then update your `DATABASE_URL` to use port 5433.

### Container Won't Start

Check the logs:
```bash
docker-compose logs postgres
```

Common issues:
- Port conflict (see above)
- Docker daemon not running
- Insufficient permissions

### Data Persistence

Data is stored in a Docker volume named `postgres_data`. To view volumes:

```bash
docker volume ls
```

To inspect the volume:
```bash
docker volume inspect open-x_postgres_data
```

## Health Check

The PostgreSQL container includes a health check that runs every 10 seconds:

```bash
docker-compose ps
```

Look for "healthy" status. If unhealthy, check logs.

## Production Note

⚠️ **This setup is for local development only.** 

For production:
- Use strong passwords
- Enable SSL/TLS
- Configure proper backups
- Use managed database services (AWS RDS, Google Cloud SQL, etc.)
- Restrict network access
