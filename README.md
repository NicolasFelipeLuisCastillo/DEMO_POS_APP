# Suma — Calculadora POS para tiendas de barrio

Calculadora de bolsillo con pagos digitales **Nequi** y **efectivo**. Funciona **100% local** (sin internet), empaquetada como aplicación de escritorio para Windows, macOS y Linux.

![Tauri](https://img.shields.io/badge/Tauri-2.x-blueviolet) ![React](https://img.shields.io/badge/React-18-61dafb) ![Vite](https://img.shields.io/badge/Vite-5-646cff) ![License](https://img.shields.io/badge/license-MIT-green)

---

## ✨ Características

- **Suma libre**: tipea un número, Enter, se suma al total. Repetí las veces que quieras.
- **Desglose visible**: cada monto que sumás se ve por separado, con su X para quitarlo.
- **Dos métodos de pago**:
  - 📱 **Nequi** (rosa, un click) — registra el total como pago digital.
  - 💵 **Efectivo** (verde, dos pasos) — pedís con cuánto paga, te muestra las **vueltas**.
- **Historial colapsable** con totales separados por método.
- **Animaciones suaves**: bump, pop-in, slide-up, toast.
- **Mobile-first responsive**: se ve bien en celu, tablet y desktop.
- **Self-hosted Inter font** — no descarga nada de internet en runtime.
- **Binario chico**: ~3.5 MB el `.deb`, ~8 MB Windows (vs 150 MB de Electron).

---

## 🧱 Stack


| Capa                | Tecnología                                     |
| ------------------- | ----------------------------------------------- |
| Frontend            | React 18 + Vite 5 + TailwindCSS 3 + Zustand 4   |
| Desktop wrapper     | Tauri 2 (Rust + WebKitGTK / WebView2)           |
| Build distribución | `.deb`, `.AppImage`, `.msi`, `.exe`             |
| CI/CD               | GitHub Actions (Ubuntu 22.04)                   |
| Dev container       | Docker Compose (Ubuntu 24.04)                   |
| Persistencia        | En memoria (no persiste entre cierres todavía) |

---

## 🚀 Opción 1: Build con Docker (recomendado para equipos)

Misma imagen, mismo `.deb`, en cualquier OS. **No necesitás** instalar Rust, Node ni las deps de sistema en tu máquina.

### Requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows/macOS) o Docker Engine (Linux)
- ~5 GB de espacio en disco (la imagen Docker pesa ~2 GB)

### Build

**Windows (PowerShell):**

```powershell
.\scripts\build-deb.ps1
```

**Linux / macOS:**

```bash
./scripts/build-deb.sh
```

**O directo:**

```bash
docker compose run --rm build
```

**Resultado** (después de 10-12 min la primera vez, 1-2 min después):

```
✅ Listo:
total 3.5M
-rw-r--r-- 1 root root 3.5M Suma_0.1.0_amd64.deb
```

El `.deb` queda en `./release/Suma_0.1.0_amd64.deb`.

### Probar el .deb

**Con WSL2 (recomendado en Windows):**

```powershell
wsl --install -d Ubuntu    # solo la primera vez
wsl
```

```bash
sudo apt update
sudo dpkg -i /mnt/c/Users/NicoPC/Desktop/suma-tauri/release/Suma_0.1.0_amd64.deb
sudo apt install -f
suma
```

**Validar sin instalar (rápido):**

```powershell
docker run --rm -v ${PWD}\release:/release ubuntu:24.04 bash -c "apt-get update -qq && apt-get install -y --no-install-recommends dpkg-dev file && dpkg-deb -I /release/Suma_0.1.0_amd64.deb"
```

### Otros comandos Docker

```bash
# Shell interactivo dentro del container (para debug, tests, etc.)
docker compose run --rm shell

# Dev server web (vite) en localhost:1420
docker compose up dev

# Limpiar todo (volúmenes + cache)
docker compose down -v
rm -rf release/ src-tauri/target/
```

### Dev container en VSCode (mismo entorno para todos)

Si tenés la extensión [Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers):

1. Abrí la carpeta en VSCode.
2. Aceptá "**Reopen in Container**" cuando aparezca la notificación.
3. VSCode levanta Docker, instala todo, y abre un shell con Tauri + Rust + Node listos.

Cada dev del equipo trabaja en el **mismo entorno exacto** (mismas versiones, mismas deps de sistema).

---

## 🛠 Opción 2: Build nativo en tu máquina

### Requisitos

- **Node 20+** (recomendado: [nvm](https://github.com/coreybutler/nvm-windows) o [fnm](https://github.com/Schniz/fnm))
- **Rust** ([rustup.rs](https://rustup.rs/))
- **Linux** (Debian/Ubuntu) para `.deb` / `.AppImage`:
  ```bash
  sudo apt install -y libwebkit2gtk-4.1-dev build-essential curl wget file \
                      libxdo-dev libssl-dev libayatana-appindicator3-dev \
                      librsvg2-dev libgtk-3-dev libsoup-3.0-dev \
                      libjavascriptcoregtk-4.1-dev libgdk-pixbuf-2.0-dev \
                      libatk1.0-dev libglib2.0-dev patchelf
  ```
- **Windows** para `.msi`/`.exe`: [Visual Studio Build Tools](https://visualstudio.microsoft.com/downloads/) con "Desktop development with C++". WebView2 ya viene en Win10/11.

### Comandos

```bash
npm install

# Modo desarrollo (ventana nativa con hot-reload)
npm run tauri:dev

# Build de producción
npm run tauri:build
```

#### Probar la ventana nativa en Windows

PowerShell en la carpeta del proyecto:

```powershell
cd C:\Users\NicoPC\OneDrive\Desktop\APP_CAJA_REGISTRADORA\suma-tauri
npm run tauri:dev
```

- La **primera vez** tarda 3-5 min (compila Rust). Después es instantáneo.
- Se abre una **ventana nativa de Windows** con la calculadora Suma.
- Editás `src/screens/Suma.jsx`, guardás, y la ventana se recarga sola.
- Para cerrar: `Ctrl + C` en la terminal.

Binarios generados:

- **Linux**: `src-tauri/target/release/bundle/deb/*.deb` y `bundle/appimage/*.AppImage`
- **Windows**: `src-tauri/target/release/bundle/msi/*.msi` y `Suma.exe`

---

## 🤖 CI/CD: GitHub Actions

Cada push a `main` genera binarios automáticamente.

```bash
# Configuración: 1 sola vez
git init
git add .
git commit -m "feat: initial commit"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/suma-tauri.git
git push -u origin main
```

Después andá a la pestaña **Actions** del repo y vas a ver el build corriendo. Al finalizar, los artefactos descargables:

- `suma-debian` → contiene el `.deb`
- `suma-appimage` → contiene el `.AppImage`

El workflow está en `.github/workflows/build.yml` y corre en `ubuntu-22.04` con cache de cargo.

---

## 📁 Estructura

```
suma-tauri/
├── src/                       # Frontend React
│   ├── screens/
│   │   └── Suma.jsx          # ⭐ Calculadora principal
│   ├── components/
│   │   └── Toast.jsx         # Notificaciones
│   ├── lib/
│   │   └── format.js         # money(), fechas
│   ├── App.jsx
│   ├── main.jsx              # Entry point + Inter font
│   └── index.css             # Estilos + animaciones
├── src-tauri/                # Backend Tauri (Rust)
│   ├── src/
│   │   ├── main.rs           # Entry Rust
│   │   └── lib.rs            # Builder de la ventana
│   ├── icons/                # Iconos (32, 128, 128@2x, 512, .ico)
│   ├── capabilities/
│   │   └── default.json      # Permisos
│   ├── Cargo.toml
│   ├── build.rs
│   └── tauri.conf.json       # Config ventana + bundle
├── .github/
│   └── workflows/
│       └── build.yml         # CI → .deb + .AppImage
├── .devcontainer/
│   └── devcontainer.json     # VSCode dev container
├── scripts/
│   ├── build-deb.sh          # Build Docker (Linux/macOS)
│   └── build-deb.ps1         # Build Docker (Windows)
├── Dockerfile                # Ubuntu 24.04 + Rust + Tauri deps
├── docker-compose.yml        # Servicios: build, shell, dev
├── .dockerignore
├── .gitignore
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

---

## 💻 Uso de la app


| Acción                     | Cómo                                                   |
| --------------------------- | ------------------------------------------------------- |
| Sumar un monto              | Tipeá el número →`Enter` (o "Sumar ↑")              |
| Quitar el último           | Click "↶ Deshacer último"                             |
| Quitar un monto específico | Click en el`✕` de ese monto en la lista                |
| Limpiar todo                | Click "✕ Limpiar todos"                                |
| Cobrar por Nequi            | Click "📱 Nequi" — registra directo                    |
| Cobrar en efectivo          | Click "💵 Efectivo" → tipeá con cuánto paga → Enter |
| Ver vueltas                 | Aparece automáticamente en el panel verde              |
| Ocultar historial           | Click en el header "Pagos (N)"                          |

### Atajos de teclado

- `Enter` en el input → suma el monto
- `Enter` en el input de efectivo → confirma el pago
- `Esc` en el panel de efectivo → cancela

---

## 🔧 Configuración

### Cambiar el nombre/icono de la app

1. Reemplazá los archivos en `src-tauri/icons/` por los tuyos:
   - `32x32.png`, `128x128.png`, `128x128@2x.png`, `icon.png`
   - `icon.ico` (multi-resolución, requerido en Windows)
   - Todos deben ser **RGBA** (con canal alfa).
2. Editá `productName` en `src-tauri/tauri.conf.json`.

### Cambiar el tamaño de la ventana

Editá `src-tauri/tauri.conf.json` → `app.windows[0]`:

```json
{
  "title": "Suma",
  "width": 1280,
  "height": 800,
  "minWidth": 420,
  "minHeight": 600
}
```

### Cambiar el color de marca

Editá `tailwind.config.js` → `theme.extend.colors.brand`:

```js
brand: {
  50:  '#FFFBEB',
  100: '#FEF3C7',
  ...
  900: '#422006'
}
```

---

## 🐛 Troubleshooting


| Problema                                              | Solución                                                                                      |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `docker: command not found`                           | Instalá[Docker Desktop](https://docker.com/products/docker-desktop)                           |
| `Cannot connect to Docker daemon`                     | Abrí Docker Desktop y esperá a "Docker is running"                                           |
| Build muy lento                                       | Normal la 1ª vez (descarga ~300 MB de crates). Builds siguientes: 1-2 min                     |
| `no space left on device`                             | `docker system prune -a` para limpiar imágenes viejas                                         |
| `error: failed to run custom build command for tauri` | Verificá que las deps de sistema estén (sección "Build nativo")                             |
| `icon is not RGBA`                                    | Todos los PNGs en`src-tauri/icons/` deben tener canal alfa. Usá Pillow: `img.convert('RGBA')` |
| OOM (out of memory) en build                          | Bajá el paralelismo:`CARGO_BUILD_JOBS=2 docker compose run --rm build`                        |

## 📜 Licencia

MIT © 2024 — Hecho con 🇨🇴 para las tiendas de barrio colombianas.

---

## 🤝 Para tu equipo


| Tarea                           | Comando                                           |
| ------------------------------- | ------------------------------------------------- |
| Clonar el repo                  | `git clone https://github.com/.../suma-tauri.git` |
| Build el .deb (cualquier OS)    | `docker compose run --rm build`                   |
| Instalar el .deb                | `sudo dpkg -i release/Suma_0.1.0_amd64.deb`       |
| Dev con mismo entorno que todos | VSCode → "Reopen in Container"                   |
| CI/CD                           | Push a`main` → ver tab **Actions**               |
| Iterar cambios                  | `git push` → re-build automático en Actions     |

Calculadora de bolsillo para tiendas de barrio, con pagos digitales **Nequi** y **efectivo**. Funciona **100% local**, sin internet, empaquetada como aplicación de escritorio para Debian/Ubuntu.

## Características

- Suma múltiples montos con teclado (Enter para agregar)
- Vista del desglose: cada monto se ve por separado, con X para quitarlo
- Pago **Nequi** (un click) o **Efectivo** (pide con cuánto paga, calcula vueltas)
- Historial de pagos colapsable con totales por método
- Animaciones suaves (bump, pop-in, slide-up)
- Self-hosted Inter font — no descarga nada de internet
- Interfaz mobile-first responsive

## Stack

- **Frontend**: React 18 + Vite + TailwindCSS + Zustand
- **Desktop**: Tauri 2 (Rust + WebKitGTK)
- **Output**: `.deb` (Debian/Ubuntu) + `.AppImage` (universal Linux) + `.msi`/`.exe` (Windows)
- **Tamaño binario**: ~8 MB (vs 150 MB de Electron)

---

## 🚀 Opción 1: Build con Docker (recomendado para equipos)

**Misma imagen, mismo .deb**, en cualquier OS (Windows, macOS, Linux). No necesitás instalar Rust, Node ni las deps de sistema en tu máquina.

### Requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows/macOS) o Docker Engine (Linux)

### Build del .deb

**Linux/macOS:**

```bash
./scripts/build-deb.sh
```

**Windows PowerShell:**

```powershell
.\scripts\build-deb.ps1
```

O directo:

```bash
docker compose run --rm build
```

El .deb queda en `./release/Suma_0.1.0_amd64.deb`. Listo para `sudo dpkg -i`.

### Otros comandos útiles

```bash
# Abrir un shell dentro del container (para correr tests, lint, etc.)
docker compose run --rm shell

# Dev server web (vite) en localhost:1420
docker compose up dev

# Limpiar todo (volúmenes, cache, .deb viejo)
docker compose down -v
rm -rf release/
```

### Dev container en VSCode (opcional, muy cómodo)

Si tenés la extensión [Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) instalada:

1. Abrí la carpeta del proyecto en VSCode
2. Te va a preguntar "Reopen in Container" — decí **Sí**
3. VSCode levanta el container, instala deps, y te da un shell con todo listo

Cada dev del equipo trabaja en el **mismo entorno exacto** (mismo Node, misma versión de Rust, mismas deps de sistema).

---

## 🛠 Opción 2: Build nativo en tu máquina

### Requisitos

- **Node 20+** ([nvm](https://github.com/coreybutler/nvm-windows) recomendado)
- **Rust** ([rustup.rs](https://rustup.rs/))
- **Linux Debian/Ubuntu** (para .deb / .AppImage):
  ```bash
  sudo apt install -y libwebkit2gtk-4.1-dev build-essential curl wget file \
                      libxdo-dev libssl-dev libayatana-appindicator3-dev \
                      librsvg2-dev patchelf
  ```
- **Windows** (para .msi): [Visual Studio Build Tools](https://visualstudio.microsoft.com/downloads/) con "Desktop development with C++" + WebView2 (ya viene en Win10/11)

### Comandos

```bash
npm install

# Modo desarrollo (abre ventana nativa con hot-reload)
npm run tauri:dev

# Build de producción
npm run tauri:build
```

Binarios generados:

- **Linux**: `src-tauri/target/release/bundle/deb/*.deb` y `bundle/appimage/*.AppImage`
- **Windows**: `src-tauri/target/release/bundle/msi/*.msi` y `Suma.exe`

---

## 📁 Estructura

```
suma-tauri/
├── src/                       # Frontend React
│   ├── screens/Suma.jsx       # Calculadora principal
│   ├── components/Toast.jsx
│   ├── lib/format.js
│   ├── App.jsx
│   └── main.jsx
├── src-tauri/                 # Backend Tauri (Rust)
│   ├── src/
│   ├── icons/                 # Íconos de la app (32/128/256/512 + .ico)
│   ├── capabilities/
│   ├── Cargo.toml
│   └── tauri.conf.json
├── .github/workflows/
│   └── build.yml              # CI → genera .deb y .AppImage
├── .devcontainer/
│   └── devcontainer.json      # VSCode dev container
├── scripts/
│   ├── build-deb.sh           # Build con Docker (Linux/macOS)
│   └── build-deb.ps1          # Build con Docker (Windows)
├── Dockerfile
├── docker-compose.yml
├── package.json
└── vite.config.js
```

## Para tu equipo


| Tarea                           | Comando                                      |
| ------------------------------- | -------------------------------------------- |
| Build el .deb (todos los OS)    | `docker compose run --rm build`              |
| Instalar el .deb                | `sudo dpkg -i release/Suma_0.1.0_amd64.deb`  |
| Dev en VSCode con mismo entorno | Dev Containers → "Reopen in Container"      |
| CI/CD                           | Push a`main` → ver tab **Actions** del repo |
