#!/bin/sh
set -e

export DJANGO_SETTINGS_MODULE="${DJANGO_SETTINGS_MODULE:-config.settings.development}"
export USE_SQLITE="${USE_SQLITE:-True}"
export SQLITE_PATH="${SQLITE_PATH:-/app/data/db.sqlite3}"

python manage.py migrate --noinput
python manage.py seed_pos || true

exec gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 2
