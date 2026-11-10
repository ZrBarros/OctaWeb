# Backend Python da Octacore

Reimplementação compatível da API original em **Python, FastAPI, SQLAlchemy 2, Pydantic e psycopg**. Ela usa diretamente as mesmas 14 tabelas PostgreSQL de `../database/01_schema.sql` e não cria nem altera o schema.

## Executar localmente

```powershell
cd backend-python
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements-dev.txt
Copy-Item .env.example .env
uvicorn app.main:app --reload --port 3333
```

O PostgreSQL deve estar acessível pela `DATABASE_URL`. A API oferece:

- health check em `/health`;
- Swagger em `/docs`;
- OpenAPI em `/docs/openapi.json`;
- rotas compatíveis sob `/api/v1`;
- uploads públicos sob `/uploads`.

## Testes e qualidade

```powershell
pytest
ruff check app tests
```

## Compatibilidade

- Mesmas rotas e envelopes JSON do backend Fastify.
- Mesmos nomes de campos usados pelo frontend.
- JWT HS256 com os mesmos segredos e tipos `access`, `refresh` e `reset`.
- Refresh token no cookie `octacore_refresh`, `httpOnly`, `SameSite=Strict`.
- Hashes bcrypt existentes continuam válidos; novas senhas usam custo 12.
- Pedidos usam transação serializável, bloqueio pessimista e preço congelado.
- Cancelamento devolve estoque e respeita a mesma máquina de estados.
- Uploads validam tamanho, MIME, assinatura binária e nome UUID.

O Docker Compose principal já constrói `backend-python/`. O diretório `backend/` permanece temporariamente apenas como referência e possibilidade de rollback, enquanto `docker-compose.python.yml` permite subir uma segunda instância Python de teste na porta 3334.

