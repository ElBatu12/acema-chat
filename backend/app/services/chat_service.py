import uuid
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.chat import Chat, ChatParticipant
from app.models.user import User
from app.schemas.chat import ChatCreate


def create_chat(db: Session, creator_id: uuid.UUID, chat_data: ChatCreate) -> Chat:
    # set() evita duplicados y garantiza que el creador siempre sea participante.
    all_ids = list(set([creator_id] + list(chat_data.participant_ids)))

    if len(all_ids) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Se necesita al menos un participante adicional",
        )

    participants = db.query(User).filter(User.id.in_(all_ids)).all()
    if len(participants) != len(all_ids):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Uno o más usuarios no fueron encontrados",
        )

    chat = Chat(name=chat_data.name)
    db.add(chat)
    db.flush()

    for participant in participants:
        db.add(ChatParticipant(chat_id=chat.id, user_id=participant.id))

    db.commit()
    db.refresh(chat)
    return chat


def get_user_chats(db: Session, user_id: uuid.UUID) -> list[Chat]:
    return (
        db.query(Chat)
        .join(ChatParticipant)
        .filter(ChatParticipant.user_id == user_id)
        .order_by(Chat.created_at.desc())
        .all()
    )


def get_chat_by_id(db: Session, chat_id: uuid.UUID, user_id: uuid.UUID) -> Chat:
    chat = (
        db.query(Chat)
        .join(ChatParticipant)
        .filter(Chat.id == chat_id, ChatParticipant.user_id == user_id)
        .first()
    )
    if not chat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversación no encontrada",
        )
    return chat


def is_chat_participant(db: Session, chat_id: uuid.UUID, user_id: uuid.UUID) -> bool:
    return (
        db.query(ChatParticipant)
        .filter(
            ChatParticipant.chat_id == chat_id,
            ChatParticipant.user_id == user_id,
        )
        .first()
        is not None
    )
