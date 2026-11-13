from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin
from app.services.user_service import get_user_by_email
from app.utils.security import hash_password, verify_password, create_access_token


def register_user(db: Session, user_data: UserCreate) -> tuple[str, User]:
    # Los correos se normalizan a minúsculas para evitar duplicados por mayúsculas.
    existing = get_user_by_email(db, user_data.email.lower())
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="El correo electrónico ya está registrado",
        )

    user = User(
        name=user_data.name,
        email=user_data.email.lower(),
        password_hash=hash_password(user_data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id)})
    return token, user


# Mismo mensaje para correo inexistente y contraseña incorrecta, para no revelar qué usuarios existen.
def login_user(db: Session, credentials: UserLogin) -> tuple[str, User]:
    user = get_user_by_email(db, credentials.email.lower())
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas",
        )

    token = create_access_token({"sub": str(user.id)})
    return token, user
