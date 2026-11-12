#!/bin/sh
set -eu

# Docker creates a new named volume as root, independently of the image owner.
chown octacore:octacore /app/uploads
exec runuser -u octacore -- "$@"
