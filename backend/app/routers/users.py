from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.user import UserPublic
from app.services.user_service import get_all_users
from app.dependencies import get_current_user


router = APIRouter()


@router.get("", response_model=list[UserPublic])
def list_users(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    users = get_all_users(db, exclude_id=current_user.id)
    return [UserPublic.model_validate(u) for u in users]
