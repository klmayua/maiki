"""Guild routes."""
from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from slugify import slugify

from app.deps import get_db, get_current_user
from app.models import Guild, User
from app.schemas import GuildCreate, GuildResponse

router = APIRouter(prefix="/guilds", tags=["guilds"])


@router.get("/", response_model=List[GuildResponse])
def list_guilds(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    category: str = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
) -> Any:
    """List available guilds."""
    query = db.query(Guild).filter(Guild.is_active == True)

    if category:
        query = query.filter(Guild.category == category)

    guilds = query.order_by(Guild.member_count.desc()).offset(skip).limit(limit).all()
    return guilds


@router.get("/my")
def get_my_guilds(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Get my guild memberships."""
    return [
        {
            "id": g.id,
            "name": g.name,
            "category": g.category,
            "joined_at": next(
                (m.joined_at for m in current_user.guild_memberships if m.guild_id == g.id),
                None
            ),
        }
        for g in current_user.guilds
    ]


@router.post("/{guild_id}/join")
def join_guild(
    guild_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Join a guild."""
    guild = db.query(Guild).filter(Guild.id == guild_id).first()
    if not guild:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Guild not found",
        )

    if guild in current_user.guilds:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already a member",
        )

    current_user.guilds.append(guild)
    guild.member_count += 1

    db.add(current_user)
    db.add(guild)
    db.commit()

    return {"message": f"Joined {guild.name}"}


@router.post("/{guild_id}/leave")
def leave_guild(
    guild_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Leave a guild."""
    guild = db.query(Guild).filter(Guild.id == guild_id).first()
    if not guild:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Guild not found",
        )

    if guild not in current_user.guilds:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Not a member",
        )

    current_user.guilds.remove(guild)
    guild.member_count -= 1

    db.add(current_user)
    db.add(guild)
    db.commit()

    return {"message": f"Left {guild.name}"}
