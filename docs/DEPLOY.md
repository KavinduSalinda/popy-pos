# Deploy Popy POS (free)

Host the React app as a static site and the Django API on PythonAnywhere with MySQL.

This is suitable for a demo. A live shop should use an always-on paid API host.

## 1. Backend — PythonAnywhere

1. Create a free account at [pythonanywhere.com](https://www.pythonanywhere.com).
2. In a **Bash console**, clone the repo and install dependencies:

```bash
git clone <your-repo-url> popy
cd popy/popy-be
python3.12 -m venv ~/venv/popy
source ~/venv/popy/bin/activate
pip install -r requirements.txt
```

Use the same Python version you pick for the web app.

3. **Web** tab → **Add a new web app** → **Manual configuration** → Python 3.12 (or 3.11).
4. **Databases** tab → create a MySQL database. Note the host (`yourusername.mysql.pythonanywhere-services.com`), db name (`yourusername$pos_db`), and password.
5. Create `popy-be/.env` (do not commit it):

```env
DJANGO_SETTINGS_MODULE=config.settings.production
SECRET_KEY=<long random string>
DEBUG=False
ALLOWED_HOSTS=yourusername.pythonanywhere.com

CORS_ALLOWED_ORIGINS=https://your-app.vercel.app
CSRF_TRUSTED_ORIGINS=https://yourusername.pythonanywhere.com,https://your-app.vercel.app

DB_NAME=yourusername$pos_db
DB_USER=yourusername
DB_PASSWORD=<mysql password>
DB_HOST=yourusername.mysql.pythonanywhere-services.com
DB_PORT=3306
```

Replace `your-app.vercel.app` after the frontend deploy (step 2). Origins must include `https://` and no trailing slash.

6. Edit the WSGI file (Web tab). Set production settings **before** importing the app:

```python
import os
import sys

path = "/home/yourusername/popy/popy-be"
if path not in sys.path:
    sys.path.insert(0, path)

os.environ["DJANGO_SETTINGS_MODULE"] = "config.settings.production"

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
```

7. Web tab:
   - **Source code** / working directory: `/home/yourusername/popy/popy-be`
   - **Virtualenv**: `/home/yourusername/venv/popy`
   - **Static files** mapping: URL `/static/` → Directory `/home/yourusername/popy/popy-be/staticfiles`

8. In the Bash console (venv activated):

```bash
cd ~/popy/popy-be
python manage.py migrate
python manage.py createsuperuser
python manage.py collectstatic --noinput
```

9. Click **Reload** on the Web tab. API: `https://yourusername.pythonanywhere.com/api`.

The free plan has no custom domain, limited CPU, and allowlisted outbound HTTP. Brevo / Text.lk may not work until those hosts are allowed.

## 2. Frontend — Vercel

1. Push this repo to GitHub.
2. Import the project at [vercel.com](https://vercel.com).
3. Settings:
   - **Root Directory:** `popy-fe`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Environment variable (Production):

| Name | Value |
|------|--------|
| `VITE_API_BASE_URL` | `https://yourusername.pythonanywhere.com/api` |

This is baked in at **build** time. Change it, then redeploy.

5. Deploy. Copy the app URL (e.g. `https://popy-fe.vercel.app`).
6. Add that origin to backend `CORS_ALLOWED_ORIGINS` and `CSRF_TRUSTED_ORIGINS`, then reload the PythonAnywhere app.

`popy-fe/vercel.json` already rewrites routes to `index.html` so React Router works.

### Cloudflare Pages instead of Vercel

Same build: root `popy-fe`, output `dist`, set `VITE_API_BASE_URL`. `public/_redirects` covers SPA routing.

## 3. Smoke test

1. Open the frontend URL and log in.
2. Select a shop (the `X-Shop-Id` header must pass CORS).
3. Complete one checkout.

If the browser reports a CORS error, the frontend origin is missing from `CORS_ALLOWED_ORIGINS`, or the origin has a trailing slash / `http` vs `https` mismatch.

## Local production-style run

```bash
cd popy-be
# .env: DJANGO_SETTINGS_MODULE=config.settings.production and MySQL vars
gunicorn config.wsgi:application --bind 0.0.0.0:8000
```
