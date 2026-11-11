import os

os.environ.setdefault("ENVIRONMENT", "test")
os.environ.setdefault("DATABASE_URL", "postgresql://postgres:postgres@localhost:5433/octacore?schema=octacore")
os.environ.setdefault("FRONTEND_ORIGIN", "http://localhost:3000")
os.environ.setdefault("PUBLIC_API_URL", "http://localhost:3333")
os.environ.setdefault("JWT_ACCESS_SECRET", "a" * 32)
os.environ.setdefault("JWT_REFRESH_SECRET", "b" * 32)
os.environ.setdefault("JWT_RESET_SECRET", "c" * 32)
os.environ.setdefault("PASSWORD_RESET_URL", "http://localhost:3000/redefinir-senha")

