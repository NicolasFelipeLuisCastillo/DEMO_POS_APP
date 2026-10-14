# Dockerfile para Suma (Tauri 2)
# Ubuntu 24.04 trae webkit2gtk-4.1, libsoup-3.0, etc. que Tauri 2 necesita.

FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive \
    CARGO_HOME=/usr/local/cargo \
    RUSTUP_HOME=/usr/local/rustup \
    PATH=/usr/local/cargo/bin:/usr/local/bin:/usr/bin:/bin:$PATH

# ── Deps del sistema para Tauri 2 (webkit2gtk-4.1, soup-3.0, gtk-3) ──────
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    ca-certificates \
    curl \
    file \
    git \
    libatk1.0-dev \
    libayatana-appindicator3-dev \
    libc6-dev \
    libgdk-pixbuf-2.0-dev \
    libglib2.0-dev \
    libgtk-3-dev \
    libjavascriptcoregtk-4.1-dev \
    librsvg2-dev \
    libsoup-3.0-dev \
    libssl-dev \
    libwebkit2gtk-4.1-dev \
    libxdo-dev \
    patchelf \
    wget \
    && rm -rf /var/lib/apt/lists/*

# ── Rust (toolchain estable, perfil mínimo) ────────────────────────────────
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | \
    sh -s -- -y --default-toolchain stable --profile minimal --no-modify-path \
    && chmod -R a+rX "$RUSTUP_HOME" "$CARGO_HOME"

# ── Workspace ──────────────────────────────────────────────────────────────
WORKDIR /app

CMD ["/bin/bash"]
