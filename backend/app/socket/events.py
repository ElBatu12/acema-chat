import uuid
import jwt
import socketio
from app.database import SessionLocal
from app.models.chat import Chat
from app.utils.security import decode_token
from app.services.user_service import get_user_by_id
from app.services.message_service import create_message
from app.services.chat_service import is_chat_participant


sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins="*",
)

connected_users: dict[str, str] = {}


@sio.event
async def connect(sid: str, environ: dict, auth: dict) -> None:
    if not auth or not auth.get("token"):
        raise socketio.exceptions.ConnectionRefusedError("Autenticación requerida")

    try:
        payload = decode_token(auth["token"])
        user_id_str: str | None = payload.get("sub")
        if not user_id_str:
            raise socketio.exceptions.ConnectionRefusedError("Token inválido")

        user_id = uuid.UUID(user_id_str)
        db = SessionLocal()
        try:
            user = get_user_by_id(db, user_id)
            if not user:
                raise socketio.exceptions.ConnectionRefusedError("Usuario no encontrado")

            connected_users[sid] = user_id_str
            await sio.enter_room(sid, f"user_{user_id_str}")
        finally:
            db.close()

    except socketio.exceptions.ConnectionRefusedError:
        raise
    except (jwt.PyJWTError, ValueError):
        raise socketio.exceptions.ConnectionRefusedError("Token inválido")


@sio.event
async def disconnect(sid: str) -> None:
    connected_users.pop(sid, None)


# Los eventos de socket no pasan por Pydantic, por eso se valida manualmente cada dato recibido.
MAX_MESSAGE_LENGTH = 2000


@sio.on("send_message")
async def handle_send_message(sid: str, data: dict) -> dict:
    # El valor retornado llega al cliente como ack: {ok, error?}.
    if sid not in connected_users:
        return {"ok": False, "error": "No autenticado"}

    if not isinstance(data, dict):
        return {"ok": False, "error": "Datos inválidos"}

    chat_id_str = data.get("chat_id")
    content = data.get("content")
    content = content.strip() if isinstance(content, str) else ""

    if not content:
        return {"ok": False, "error": "El mensaje no puede estar vacío"}

    if len(content) > MAX_MESSAGE_LENGTH:
        return {"ok": False, "error": f"El mensaje no puede superar {MAX_MESSAGE_LENGTH} caracteres"}

    if not chat_id_str:
        return {"ok": False, "error": "ID de conversación requerido"}

    try:
        user_id = uuid.UUID(connected_users[sid])
        chat_id = uuid.UUID(str(chat_id_str))
    except ValueError:
        return {"ok": False, "error": "Datos inválidos"}

    db = SessionLocal()
    try:
        # Solo los participantes pueden escribir en el chat.
        if not is_chat_participant(db, chat_id, user_id):
            return {"ok": False, "error": "No tienes acceso a esta conversación"}

        message = create_message(db, chat_id, user_id, content)

        message_data = {
            "id": str(message.id),
            "chat_id": str(message.chat_id),
            "content": message.content,
            "sender": {
                "id": str(message.sender.id),
                "name": message.sender.name,
            },
            # created_at se guarda en UTC naive; la "Z" indica UTC explícitamente.
            "created_at": message.created_at.isoformat() + "Z",
        }

        chat = db.query(Chat).filter(Chat.id == chat_id).first()
        if chat:
            for participant in chat.participants:
                # Cada usuario tiene su propia sala (user_<id>), así solo recibe mensajes de sus chats.
                await sio.emit("new_message", message_data, room=f"user_{participant.user_id}")
        return {"ok": True}
    except Exception:
        db.rollback()
        return {"ok": False, "error": "Error interno al enviar el mensaje"}
    finally:
        db.close()
