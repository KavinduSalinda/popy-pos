# Popy POS Backend

Django REST Framework API for the Popy POS React frontend.

## Quick start

```bash
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
copy .env.example .env
python manage.py migrate
python manage.py seed_pos
python manage.py runserver 8000
```

API base: `http://localhost:8000/api`

### Dev login

- **Email:** `admin@test.com`
- **Password:** `123456`

## Configuration

- **SQLite** (default): set `USE_SQLITE=True` in `.env` — no MySQL required for local dev.
- **MySQL:** set `USE_SQLITE=False` and configure `DB_*` variables in `.env`.

## Project layout

See `docs/BACKEND_SPEC_DJANGO_DRF.md` for full API specification.
