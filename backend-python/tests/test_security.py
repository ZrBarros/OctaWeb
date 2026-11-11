from app.config import Settings
from app.security import create_token, decode_token, hash_password, verify_password


def settings() -> Settings:
    return Settings(
        database_url="postgresql://postgres:postgres@localhost:5433/octacore",
        frontend_origin="http://localhost:3000",
        public_api_url="http://localhost:3333",
        jwt_access_secret="a" * 32,
        jwt_refresh_secret="b" * 32,
        jwt_reset_secret="c" * 32,
        password_reset_url="http://localhost:3000/redefinir-senha",
    )


def test_access_token_round_trip() -> None:
    token = create_token(settings(), "access", 7, "ADMIN")
    payload = decode_token(settings(), "access", token)
    assert payload.sub == "7"
    assert payload.perfil == "ADMIN"


def test_rejects_wrong_token_kind() -> None:
    token = create_token(settings(), "refresh", 7, "USUARIO")
    try:
        decode_token(settings(), "access", token)
    except Exception as error:
        assert getattr(error, "status_code", None) == 401
    else:
        raise AssertionError("Token de tipo incorreto foi aceito")


def test_bcrypt_round_trip() -> None:
    hashed = hash_password("SenhaForte1")
    assert verify_password("SenhaForte1", hashed)
    assert not verify_password("SenhaErrada1", hashed)

