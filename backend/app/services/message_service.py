import uuid
from sqlalchemy.orm import Session
from app.models.message import Message


def create_message(db: Session, chat_id: uuid.UUID, sender_id: uuid.UUID, content: str) -> Message:
    message = Message(
        chat_id=chat_id,
        sender_id=sender_id,
        content=content.strip(),
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    return message


def get_chat_messages(db: Session, chat_id: uuid.UUID) -> list[Message]:
    return (
        db.query(Message)
        .filter(Message.chat_id == chat_id)
        .order_by(Message.created_at.asc())
        .all()
    )


def get_last_message(db: Session, chat_id: uuid.UUID) -> Message | None:
    return (
        db.query(Message)
        .filter(Message.chat_id == chat_id)
        .order_by(Message.created_at.desc())
        .first()
    )
