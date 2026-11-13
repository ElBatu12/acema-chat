import uuid
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.chat import ChatCreate, ChatResponse
from app.schemas.message import MessageResponse, MessageSender
from app.schemas.user import UserPublic
from app.services.chat_service import create_chat, get_user_chats, get_chat_by_id
from app.services.message_service import get_chat_messages, get_last_message
from app.dependencies import get_current_user
from app.socket.events import sio


router = APIRouter()


def _serialize_chat(chat, last_msg) -> ChatResponse:
    participants = [UserPublic.model_validate(p.user) for p in chat.participants]
    last_message = None
    if last_msg:
        last_message = MessageResponse(
            id=last_msg.id,
            chat_id=last_msg.chat_id,
            content=last_msg.content,
            sender=MessageSender(id=last_msg.sender.id, name=last_msg.sender.name),
            created_at=last_msg.created_at,
        )
    return ChatResponse(
        id=chat.id,
        name=chat.name,
        participants=participants,
        last_message=last_message,
        created_at=chat.created_at,
    )


@router.get("", response_model=list[ChatResponse])
def list_chats(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    chats = get_user_chats(db, current_user.id)
    return [_serialize_chat(chat, get_last_message(db, chat.id)) for chat in chats]


@router.post("", response_model=ChatResponse, status_code=status.HTTP_201_CREATED)
async def create_new_chat(
    chat_data: ChatCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    chat = create_chat(db, current_user.id, chat_data)
    response_chat = _serialize_chat(chat, None)
    payload = response_chat.model_dump(mode="json")
    for participant in chat.participants:
        await sio.emit("new_chat", payload, room=f"user_{participant.user_id}")
    return response_chat


@router.get("/{chat_id}/messages", response_model=list[MessageResponse])
def get_messages(
    chat_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    get_chat_by_id(db, chat_id, current_user.id)
    messages = get_chat_messages(db, chat_id)
    return [
        MessageResponse(
            id=msg.id,
            chat_id=msg.chat_id,
            content=msg.content,
            sender=MessageSender(id=msg.sender.id, name=msg.sender.name),
            created_at=msg.created_at,
        )
        for msg in messages
    ]
