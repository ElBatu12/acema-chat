import uuid
from sqlalchemy.orm import Session
from app.models.user import User


def get_user_by_id(db: Session, user_id: uuid.UUID) -> User | None:
    return db.query(User).filter(User.id == user_id).first()


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email).first()


def get_all_users(db: Session, exclude_id: uuid.UUID) -> list[User]:
    return db.query(User).filter(User.id != exclude_id).order_by(User.name).all()
