# IELTS Testing Platform

## Quick Setup

### 1. Backend

```bash
cd backend
npm install
```

Edit `.env` with your PostgreSQL credentials.

```bash
npm run db:generate      # Generate Prisma client
npm run db:migrate       # Run DB migrations
npm run db:seed          # Create admin user (admin / admin123)
npm run dev              # Start backend on port 5000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev              # Start frontend on port 5173
```

### 3. Open Browser

- Frontend: http://localhost:5173
- Admin login: `admin` / `admin123`

---

## Usage Flow

1. **Admin** logs in → Dashboard → Create Test → Gets 4-digit PIN
2. **Student** registers → Login → Dashboard → Start Test → Enter PIN
3. Test runs section by section with real-time timers
4. Admin monitors live in Live Monitor tab
5. Student sees detailed results after completion
# ieltsimperiaweeklymock
# ieltsimperiaweeklymock
# ielts-immperia
