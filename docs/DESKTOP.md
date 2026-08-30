# Popy POS Desktop App (Electron)

This repository includes an Electron desktop wrapper for **Popy POS**, allowing cashiers and store managers to run Popy as a native Windows desktop application.

---

## 🚀 Running the Desktop App in Development

1. **Start the local Django backend** (in `popy-be`):
   ```bash
   cd popy-be
   python manage.py runserver 127.0.0.1:8000
   ```

2. **Start the Electron app with live reload** (in `popy-fe`):
   ```bash
   cd popy-fe
   npm run electron:dev
   ```
   This will start the Vite dev server and launch Electron connected to `http://localhost:5173`.

---

## 🛠️ Testing Localhost vs Cloud Server Connections

By default, the desktop app is configured to connect to **Localhost Backend** (`http://127.0.0.1:8000/api`).

### Switching or Configuring Server Before Login
1. On the login screen, click the **Server: Localhost / Cloud** badge at the top-right (or click **"Server settings"** below the login card).
2. You can:
   - Choose **Localhost Backend** (`http://127.0.0.1:8000/api`) for local store usage.
   - Choose **Cloud Backend** (`https://kavindu10.pythonanywhere.com/api`) for remote hosted database.
   - Enter a **Custom Server URL** (e.g., store local network server `http://192.168.1.100:8000/api`).
3. Click **"Test Connection"** to verify that the backend is online and check response latency.
4. Click **"Apply Settings"**. The choice is saved in `localStorage` and persists across launches.

---

## 📦 Building the Desktop Application (`.exe` Installer)

To package the desktop application into a standalone Windows installer and portable `.exe`:

```bash
cd popy-fe
npm run electron:build
```

The output installers will be created in `popy-fe/release/`:
- **Installer:** `Popy POS Setup 1.0.0.exe` (NSIS installer with desktop & start menu shortcuts)
- **Portable:** `Popy POS 1.0.0.exe` (Standalone portable single executable)

To quickly pack the app into a directory without creating the installer:
```bash
npm run electron:pack
```

To preview the production package locally:
```bash
npm run electron:preview
```
