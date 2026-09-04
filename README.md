# Popy POS

Full-stack **point of sale and inventory** platform for multi-branch retail shops.

| Layer | Stack |
|-------|--------|
| Frontend | React 19, TypeScript, Vite, MUI, Redux Toolkit / RTK Query, Electron |
| Backend | Django 5, Django REST Framework, SimpleJWT |
| Data | SQLite (dev) or MySQL (prod), IndexedDB offline queue |

```
popy/
├── popy-be/     # Django REST API
├── popy-fe/     # React SPA + Electron desktop shell
├── tests/       # Shared backend pytest suite + runners
└── docs/        # Feature docs and deploy guides
```

## Prerequisites

- **Node.js** 20+ and npm
- **Python** 3.11+ (3.12 recommended)
- Optional: Docker Desktop (for one-command stack)

## Quick start (local)

### 1. Backend

```bash
cd popy-be
python -m venv venv

# Windows
venv\Scripts\activate
# macOS / Linux
# source venv/bin/activate

pip install -r requirements.txt
copy .env.example .env          # Windows
# cp .env.example .env          # macOS / Linux

python manage.py migrate
python manage.py seed_pos       # optional demo data
python manage.py runserver 8000
```

API: `http://localhost:8000/api`  
Health: `http://localhost:8000/api/health`  
Admin: `http://localhost:8000/admin/`

**Seed login:** `admin@test.com` / `123456`

### 2. Frontend

```bash
cd popy-fe
npm ci
copy .env.example .env          # Windows
# cp .env.example .env
npm run dev
```

App: `http://localhost:5173` (Vite proxies `/api` → `:8000`)

### 3. Desktop (optional)

```bash
cd popy-fe
npm run electron:dev
```

See [docs/DESKTOP.md](docs/DESKTOP.md).

## One-command Docker stack

```bash
docker compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| API | http://localhost:8000/api |
| Health | http://localhost:8000/api/health |

Uses SQLite inside the API container for a self-contained sandbox.

## Tests

From a fresh clone, after installing each package:

```bash
# Frontend unit tests + coverage
cd popy-fe
npm ci
npm test
npm run test:coverage
npm run typecheck
npm run lint

# Backend API tests (separate SQLite DB under tests/)
cd ../tests
pip install -r requirements.txt
# ensure popy-be deps are installed in the same / a linked venv
pip install -r ../popy-be/requirements.txt
pytest backend -q
```

Or run the combined runner:

```bash
cd tests
python run_all.py
```

## Scripts (frontend)

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite dev server |
| `npm run build` | Production build |
| `npm run test` | Vitest |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run electron:build` | Windows installer under `popy-fe/release/` |

## Environment

- Frontend: [popy-fe/.env.example](popy-fe/.env.example)
- Backend: [popy-be/.env.example](popy-be/.env.example)

Never commit real `.env` files or production secrets.

## Deploy

Free-hosting guide (PythonAnywhere + Vercel): [docs/DEPLOY.md](docs/DEPLOY.md)

## Documentation

- [docs/README.md](docs/README.md) — architecture and feature index
- [docs/DESKTOP.md](docs/DESKTOP.md) — Electron desktop app
- [tests/README.md](tests/README.md) — test suite details

## License

Private / proprietary unless otherwise noted.
