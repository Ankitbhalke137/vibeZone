#!/bin/sh
# Generates a self-signed server cert on first boot, then hands off to the
# official postgres entrypoint. Certs live on container FS (regenerated on
# recreate — cheap) and are referenced by the `ssl=on` command args. (D7)
set -e

CERT_DIR=/etc/postgresql/certs

if [ ! -f "$CERT_DIR/server.key" ]; then
  echo "[ssl-init] generating self-signed TLS certificate…"
  mkdir -p "$CERT_DIR"
  openssl req -new -x509 -nodes -days 800 \
    -subj "/CN=vibezone-db" \
    -addext "subjectAltName=DNS:vibezone-db,DNS:localhost,IP:127.0.0.1" \
    -keyout "$CERT_DIR/server.key" \
    -out "$CERT_DIR/server.crt"
  PUID="$(id -u postgres)"
  PGID="$(id -g postgres)"
  chown "$PUID:$PGID" "$CERT_DIR/server.key" "$CERT_DIR/server.crt"
  chmod 600 "$CERT_DIR/server.key"
  chmod 644 "$CERT_DIR/server.crt"
  echo "[ssl-init] done."
fi

exec /usr/local/bin/docker-entrypoint.sh "$@"
