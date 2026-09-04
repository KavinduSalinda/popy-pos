# Contributing

## Setup

Follow the root [README](README.md) to install and run `popy-be` and `popy-fe`.

## Before opening a PR

```bash
# Frontend
cd popy-fe
npm run lint
npm run typecheck
npm test

# Backend API suite
cd ../tests
pip install -r ../popy-be/requirements.txt -r requirements.txt
pytest backend -q
```

GitHub Actions runs the same checks on every push/PR (see `.github/workflows/ci.yml`).

## Commit style

Prefer small, focused commits that land with the tests that prove them (especially for offline sync, sales, and shop isolation).

## Environment

Copy `.env.example` files; never commit real secrets or local credentials.
