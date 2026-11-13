# Acema Chat — Manual de Ejecución

Aplicación de chat en tiempo real desarrollada con **Next.js** (frontend), **FastAPI + Python** (backend) y **PostgreSQL** (base de datos), con comunicación en tiempo real vía **Socket.IO**.

---

## Funcionalidades

- Registro, login, logout y rutas protegidas (frontend y socket).
- Listado de usuarios, creación de chats con uno o más usuarios y listado de chats.
- Mensajería en tiempo real con Socket.IO, con remitente y hora de envío.
- Cada usuario solo recibe los mensajes de los chats en los que participa.
- Historial persistido en base de datos.
- Validación y mensajes de error claros en frontend y backend.
- Estados de carga y bloqueo de acciones durante las peticiones.
- Aviso de "sin conexión" y reconexión automática.
- Estado global con Context API, Tailwind CSS, animaciones y Docker.

---

## Decisiones tecnológicas

| Capa | Tecnología | Justificación |
|------|-----------|---------------|
| Frontend | Next.js 14 + TypeScript | Requerido por la prueba; App Router para enrutamiento moderno |
| Estilos | Tailwind CSS | Desarrollo rápido y consistente, diseño responsive |
| Estado global | Context API (Auth, Socket, Chat) | Solución nativa de React, sin dependencias externas |
| Backend | FastAPI (Python) | Alto rendimiento, tipado con Pydantic, documentación automática |
| Tiempo real | python-socketio + socket.io-client | Implementación robusta de Socket.IO para Python y JavaScript |
| Base de datos | PostgreSQL + SQLAlchemy | Persistencia relacional sólida, ORM maduro con soporte multi-dialecto |
| Autenticación | JWT (PyJWT + bcrypt) | Estándar moderno de la industria, seguro y stateless |
| Contenedores | Docker + docker-compose | Levanta toda la infraestructura con un solo comando |

---

## Requisitos previos

- [Docker](https://www.docker.com/) y Docker Compose instalados, **o**
- Python 3.10 o superior (probado con 3.13) y Node.js 18.17 o superior instalados localmente

---

## Opción A — Con Docker

> Asegúrate de que los puertos 3000, 8000 y 5432 estén libres. Si tienes PostgreSQL instalado localmente, detén ese servicio o libera el puerto 5432 antes de iniciar.

```bash
cd acema-chat
docker compose up --build
```

> En instalaciones antiguas de Docker el comando es `docker-compose` (con guion).

La aplicación quedará disponible en:
- **Frontend:** http://localhost:3000
- **Backend / API:** http://localhost:8000
- **Documentación API:** http://localhost:8000/docs

Para detener:
```bash
docker compose down
```

Para detener y eliminar los datos de la base de datos:
```bash
docker compose down -v
```

---

## Opción B — Ejecución local sin Docker

### 1. Base de datos

Instala PostgreSQL y crea la base de datos:

```sql
CREATE DATABASE acema_chat;
```

> **Nota:** Para pruebas locales rápidas sin instalar PostgreSQL, puedes configurar `DATABASE_URL=sqlite:///./acema_chat.db` en el archivo `.env` del backend.

### 2. Backend

```bash
cd backend

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# En Windows:
venv\Scripts\activate
# En macOS / Linux:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
```

> En Windows, si `python` no se reconoce, usa `py -m venv venv`. Para copiar el archivo de entorno en CMD puedes usar `copy .env.example .env`.

Contenido del archivo `backend/.env`:
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/acema_chat
SECRET_KEY=clave-secreta-para-firmar-tokens
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Las tablas se generan automáticamente al iniciar el servidor.

> Asegúrate de que los puertos 3000, 8000 y 5432 estén libres.

### 3. Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
```

Contenido del archivo `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

```bash
npm run dev
```

Accede a http://localhost:3000.

---

## Estructura del proyecto

```
acema-chat/
├── backend/
│   ├── app/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── routers/
│   │   ├── services/
│   │   ├── socket/
│   │   ├── utils/
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── dependencies.py
│   │   └── main.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── (auth)/
│       │   │   ├── login/page.tsx
│       │   │   └── register/page.tsx
│       │   └── chat/
│       │       ├── layout.tsx
│       │       ├── page.tsx
│       │       └── [chatId]/page.tsx
│       ├── components/
│       │   ├── ui/
│       │   └── chat/
│       ├── context/
│       ├── lib/
│       └── types/
├── docker-compose.yml
└── README.md
```

---

## Endpoints de la API

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | `/api/v1/auth/register` | Registro de usuario | No |
| POST | `/api/v1/auth/login` | Inicio de sesión | No |
| GET | `/api/v1/auth/me` | Usuario autenticado | Sí |
| GET | `/api/v1/users` | Listar todos los usuarios | Sí |
| GET | `/api/v1/chats` | Listar chats del usuario | Sí |
| POST | `/api/v1/chats` | Crear nueva conversación | Sí |
| GET | `/api/v1/chats/{id}/messages` | Historial de mensajes | Sí |

La documentación interactiva Swagger UI está disponible en `/docs`.

---

## Eventos Socket.IO

| Dirección | Evento | Payload |
|-----------|--------|---------|
| Cliente → Servidor | `send_message` | `{ chat_id, content }` — responde con ack `{ ok, error? }` |
| Servidor → Cliente | `new_message` | `{ id, chat_id, content, sender, created_at }` |
| Servidor → Cliente | `new_chat` | Objeto `Chat` serializado |

La autenticación del socket se realiza enviando el JWT en el handshake: `auth: { token }`.

---

## Cómo probar

1. Abre http://localhost:3000 y registra un usuario.
2. Abre una ventana de incógnito en la misma dirección y registra un segundo usuario.
3. Desde "Nueva conversación", crea un chat con el otro usuario y envía mensajes en ambos sentidos.
4. Para probar la reconexión, detén el backend y vuelve a iniciarlo: el chat mostrará "Sin conexión" y se reconectará solo.
