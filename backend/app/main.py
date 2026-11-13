import socketio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
from app.models import User, Chat, ChatParticipant, Message
from app.routers import auth, users, chats
from app.socket.events import sio


Base.metadata.create_all(bind=engine)

fastapi_app = FastAPI(
    title="Acema Chat API",
    version="1.0.0",
)

fastapi_app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

fastapi_app.include_router(auth.router, prefix="/api/v1/auth", tags=["Autenticación"])
fastapi_app.include_router(users.router, prefix="/api/v1/users", tags=["Usuarios"])
fastapi_app.include_router(chats.router, prefix="/api/v1/chats", tags=["Conversaciones"])

app = socketio.ASGIApp(sio, fastapi_app)
