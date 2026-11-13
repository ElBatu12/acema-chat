import uuid
from datetime import datetime
from pydantic import BaseModel


class MessageSender(BaseModel):
    id: uuid.UUID
    name: str

    model_config = {"from_attributes": True}


class MessageResponse(BaseModel):
    id: uuid.UUID
    chat_id: uuid.UUID
    content: str
    sender: MessageSender
    created_at: datetime

    model_config = {"from_attributes": True}
