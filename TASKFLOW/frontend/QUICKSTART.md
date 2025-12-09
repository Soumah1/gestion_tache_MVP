# TaskFlow Quick Start Guide

## 🚀 Get Started in 3 Steps

### 1. Make sure Docker is installed
```bash
docker --version
docker compose --version
```

### 2. Build and Run
```bash
docker compose up --build
```

Wait for all services to start (usually 30-60 seconds on first run).

### 3. Open in Browser
- **Frontend**: http://localhost:5173
- **API Docs**: http://localhost:8000/docs

## 📝 First Steps

1. **Register**: Click "Sign up" and create an account
2. **Create Project**: Add your first project
3. **Add Tasks**: Click "Add Task" and organize in Kanban columns

## 🛠️ Development Commands

```bash
# Start all services
docker compose up

# Start in background
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down

# Clean everything (including data)
docker compose down -v
```

## 🔍 Troubleshooting

### Port already in use
```bash
# Check what's using the port
lsof -i :5173  # Frontend
lsof -i :8000  # Backend
lsof -i :5432  # Database

# Kill the process or change ports in docker-compose.yml
```

### Database connection error
```bash
# Restart just the backend
docker compose restart backend
```

### Frontend can't connect to backend
- Make sure backend is running: http://localhost:8000/health
- Check `VITE_API_URL` in frontend/.env

## 📊 Default Credentials

Since this is a new installation, you'll need to register first.

## 🎯 Next Steps

- [ ] Explore the Kanban board
- [ ] Create multiple projects
- [ ] Add tasks and move them between columns
- [ ] Check the API docs for advanced features

## 🆘 Need Help?

See the full README.md for detailed documentation.

