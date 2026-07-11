# Popy POS — Full Test Suite

Automated tests live in this **separate `tests/` folder** so you can run everything from one place and quickly see what broke after adding features.

## What gets tested

| Suite | What it covers |
|-------|----------------|
| **Backend API tests** | Auth, shops, catalog, parties, sales, users, settings, shop isolation, dashboard/reports |
| **Frontend unit tests** | Existing Vitest tests in `popy-fe` |
| **Frontend typecheck** | TypeScript compile check |
| **Live smoke tests** *(optional)* | Hits a running server at `http://localhost:8000` |

## Quick start

### 1. Install test dependencies (once)

```powershell
cd tests
..\popy-be\venv\Scripts\python.exe -m pip install -r requirements.txt
```

### 2. Run everything

```powershell
cd tests
.\run_all.ps1
```

Or:

```bash
cd tests
python run_all.py
```

### 3. Read the summary

At the end you'll see:

```
[OK] Backend API tests           PASS
[OK] Frontend unit tests         PASS
[XX] Frontend typecheck          FAIL
```

A JSON report is saved to `tests/reports/latest.json`.

## Useful commands

```powershell
# Backend only
.\run_all.ps1 -BackendOnly

# Frontend only
.\run_all.ps1 -FrontendOnly

# Include live server smoke checks (server must be running)
.\run_all.ps1 -WithSmoke

# Install deps + run all
.\run_all.ps1 -InstallDeps

# Run a single backend file
..\popy-be\venv\Scripts\python.exe -m pytest backend/test_07_settings.py -v

# Run one test
..\popy-be\venv\Scripts\python.exe -m pytest backend/test_06_users.py::TestUsersAPI::test_manager_can_create_cashier -v
```

## Backend test layout

```
tests/backend/
  conftest.py              # fixtures: shops, users, auth helpers
  test_01_auth.py          # login, refresh, logout
  test_02_shops.py         # shop context & accessible shops
  test_03_catalog.py       # categories & products
  test_04_parties.py       # customers & suppliers
  test_05_sales.py         # POS sales & stock
  test_06_users.py         # manager user management
  test_07_settings.py      # per-shop notification settings
  test_08_shop_isolation.py# multi-shop data isolation
  test_09_dashboard_reports.py
  test_10_smoke_live.py    # optional live server checks
```

Backend tests use a **separate SQLite database** at `tests/.test_db.sqlite3` so your dev data is never touched.

## When you add a new feature

1. Add or update tests in `tests/backend/test_XX_<area>.py`
2. Run `.\run_all.ps1`
3. Fix anything marked `FAIL` before merging

### Suggested mapping

| Feature area | Test file |
|--------------|-----------|
| Login / JWT | `test_01_auth.py` |
| Shops / multi-tenant | `test_02_shops.py`, `test_08_shop_isolation.py` |
| Products / categories | `test_03_catalog.py` |
| Customers / suppliers | `test_04_parties.py` |
| POS / sales | `test_05_sales.py` |
| Staff users | `test_06_users.py` |
| Notifications / settings | `test_07_settings.py` |
| Dashboard / reports | `test_09_dashboard_reports.py` |

## Environment variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `POPY_API_URL` | `http://localhost:8000` | Base URL for live smoke tests |

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `No module named pytest` | Run `pip install -r tests/requirements.txt` in backend venv |
| `DJANGO_SETTINGS_MODULE` error | Run pytest from the `tests/` folder (uses `pytest.ini`) |
| Frontend tests fail | Run `npm install` in `popy-fe` first |
| Smoke tests skipped | Start backend: `python manage.py runserver` and use `-WithSmoke` |
