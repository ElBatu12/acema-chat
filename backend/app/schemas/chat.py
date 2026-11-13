import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from app.schemas.user import UserPublic
from app.schemas.message import MessageResponse


class ChatCreate(BaseModel):
    participant_ids: list[uuid.UUID]
    name: Optional[str] = None


class ChatResponse(BaseModel):
    id: uuid.UUID
    name: Optional[str]
    participants: list[UserPublic]
    last_message: Optional[MessageResponse] = None
    created_at: datetime

    model_config = {"from_attributes": True}
