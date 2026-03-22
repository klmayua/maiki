"""Community/Forum API routes."""
from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_

from app.deps import get_db, get_current_user
from app.models import User
from app.models.community import (
    Community, CommunityPost, CommunityComment, PostVote, CommentVote,
    VoteType, PostType, SavedPost, community_members
)

router = APIRouter(prefix="/community", tags=["community"])


# ============== Communities ==============

@router.get("/communities")
def list_communities(
    category: Optional[str] = None,
    search: Optional[str] = None,
    sort: str = Query("members", enum=["members", "new", "posts"]),
    db: Session = Depends(get_db),
) -> Any:
    """List communities."""
    query = db.query(Community)

    if category:
        query = query.filter(Community.category == category)

    if search:
        query = query.filter(
            Community.name.ilike(f"%{search}%") |
            Community.description.ilike(f"%{search}%")
        )

    if sort == "members":
        query = query.order_by(desc(Community.member_count))
    elif sort == "new":
        query = query.order_by(desc(Community.created_at))
    elif sort == "posts":
        query = query.order_by(desc(Community.post_count))

    communities = query.all()

    return [
        {
            "id": c.id,
            "name": c.name,
            "slug": c.slug,
            "description": c.description,
            "icon_url": c.icon_url,
            "member_count": c.member_count,
            "post_count": c.post_count,
            "category": c.category,
            "is_private": c.is_private,
        }
        for c in communities
    ]


@router.get("/communities/{slug}")
def get_community(
    slug: str,
    db: Session = Depends(get_db),
) -> Any:
    """Get community details."""
    community = db.query(Community).filter(Community.slug == slug).first()

    if not community:
        raise HTTPException(status_code=404, detail="Community not found")

    return {
        "id": community.id,
        "name": community.name,
        "slug": community.slug,
        "description": community.description,
        "rules": community.rules,
        "icon_url": community.icon_url,
        "banner_url": community.banner_url,
        "member_count": community.member_count,
        "post_count": community.post_count,
        "category": community.category,
        "is_private": community.is_private,
        "created_at": community.created_at.isoformat(),
    }


@router.post("/communities/{community_id}/join")
def join_community(
    community_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Join a community."""
    community = db.query(Community).filter(Community.id == community_id).first()

    if not community:
        raise HTTPException(status_code=404, detail="Community not found")

    if community in current_user.communities:
        return {"message": "Already a member"}

    current_user.communities.append(community)
    community.member_count += 1
    db.commit()

    return {"message": "Joined successfully"}


@router.post("/communities/{community_id}/leave")
def leave_community(
    community_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Leave a community."""
    community = db.query(Community).filter(Community.id == community_id).first()

    if not community:
        raise HTTPException(status_code=404, detail="Community not found")

    if community not in current_user.communities:
        raise HTTPException(status_code=400, detail="Not a member")

    current_user.communities.remove(community)
    community.member_count -= 1
    db.commit()

    return {"message": "Left successfully"}


# ============== Posts ==============

@router.get("/posts")
def list_posts(
    community_slug: Optional[str] = None,
    sort: str = Query("hot", enum=["hot", "new", "top", "rising"]),
    time_range: str = Query("all", enum=["hour", "day", "week", "month", "year", "all"]),
    limit: int = Query(25, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
) -> Any:
    """List posts with sorting."""
    query = db.query(CommunityPost)

    if community_slug:
        community = db.query(Community).filter(Community.slug == community_slug).first()
        if community:
            query = query.filter(CommunityPost.community_id == community.id)

    # Filter by time
    if time_range != "all":
        from datetime import datetime, timedelta
        delta = {
            "hour": timedelta(hours=1),
            "day": timedelta(days=1),
            "week": timedelta(weeks=1),
            "month": timedelta(days=30),
            "year": timedelta(days=365),
        }.get(time_range, timedelta(days=1))
        query = query.filter(CommunityPost.created_at >= datetime.utcnow() - delta)

    # Sort
    if sort == "hot":
        # Hot = score + recency boost
        query = query.order_by(desc(CommunityPost.score), desc(CommunityPost.created_at))
    elif sort == "new":
        query = query.order_by(desc(CommunityPost.created_at))
    elif sort == "top":
        query = query.order_by(desc(CommunityPost.score))
    elif sort == "rising":
        # Rising = recent high engagement
        query = query.order_by(desc(CommunityPost.comment_count), desc(CommunityPost.created_at))

    posts = query.offset(offset).limit(limit).all()

    return [
        {
            "id": p.id,
            "title": p.title,
            "type": p.type.value,
            "content": p.content[:500] if p.content else None,
            "url": p.url,
            "media_url": p.media_url,
            "score": p.score,
            "upvotes": p.upvotes,
            "downvotes": p.downvotes,
            "comment_count": p.comment_count,
            "is_pinned": p.is_pinned,
            "is_nsfw": p.is_nsfw,
            "author": {
                "id": p.author.id,
                "name": p.author.full_name,
                "avatar": p.author.avatar_url,
            },
            "community": {
                "name": p.community.name,
                "slug": p.community.slug,
            },
            "created_at": p.created_at.isoformat(),
            "edited_at": p.edited_at.isoformat() if p.edited_at else None,
        }
        for p in posts
    ]


@router.post("/posts")
def create_post(
    community_id: int,
    title: str,
    type: PostType,
    content: Optional[str] = None,
    url: Optional[str] = None,
    media_url: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Create a new post."""
    community = db.query(Community).filter(Community.id == community_id).first()

    if not community:
        raise HTTPException(status_code=404, detail="Community not found")

    # Check membership
    if community.is_private and community not in current_user.communities:
        raise HTTPException(status_code=403, detail="Must join private community first")

    post = CommunityPost(
        community_id=community_id,
        author_id=current_user.id,
        title=title,
        type=type,
        content=content,
        url=url,
        media_url=media_url,
    )

    db.add(post)
    community.post_count += 1
    db.commit()

    return {
        "id": post.id,
        "message": "Post created successfully",
    }


@router.get("/posts/{post_id}")
def get_post(
    post_id: int,
    db: Session = Depends(get_db),
) -> Any:
    """Get post details with comments."""
    post = db.query(CommunityPost).filter(CommunityPost.id == post_id).first()

    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    # Increment view count
    post.view_count += 1
    db.commit()

    # Get top-level comments
    comments = db.query(CommunityComment).filter(
        and_(
            CommunityComment.post_id == post_id,
            CommunityComment.parent_id == None
        )
    ).order_by(desc(CommunityComment.score)).all()

    def comment_to_dict(c):
        return {
            "id": c.id,
            "content": c.content,
            "score": c.score,
            "author": {
                "id": c.author.id,
                "name": c.author.full_name,
                "avatar": c.author.avatar_url,
            },
            "is_best_answer": c.is_best_answer,
            "created_at": c.created_at.isoformat(),
            "replies": [comment_to_dict(r) for r in c.replies[:3]],  # Limited nesting
        }

    return {
        "id": post.id,
        "title": post.title,
        "type": post.type.value,
        "content": post.content,
        "url": post.url,
        "media_url": post.media_url,
        "score": post.score,
        "upvotes": post.upvotes,
        "downvotes": post.downvotes,
        "comment_count": post.comment_count,
        "view_count": post.view_count,
        "author": {
            "id": post.author.id,
            "name": post.author.full_name,
            "avatar": post.author.avatar_url,
        },
        "community": {
            "name": post.community.name,
            "slug": post.community.slug,
        },
        "comments": [comment_to_dict(c) for c in comments],
        "created_at": post.created_at.isoformat(),
    }


@router.post("/posts/{post_id}/vote")
def vote_post(
    post_id: int,
    vote_type: VoteType,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Vote on a post."""
    post = db.query(CommunityPost).filter(CommunityPost.id == post_id).first()

    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    # Check existing vote
    existing = db.query(PostVote).filter(
        PostVote.post_id == post_id,
        PostVote.user_id == current_user.id
    ).first()

    if existing:
        if existing.vote_type == vote_type:
            # Remove vote (toggle off)
            db.delete(existing)
            if vote_type == VoteType.UP:
                post.upvotes -= 1
            else:
                post.downvotes -= 1
        else:
            # Change vote
            old_type = existing.vote_type
            existing.vote_type = vote_type
            if old_type == VoteType.UP:
                post.upvotes -= 1
                post.downvotes += 1
            else:
                post.downvotes -= 1
                post.upvotes += 1
    else:
        # New vote
        vote = PostVote(
            post_id=post_id,
            user_id=current_user.id,
            vote_type=vote_type,
        )
        db.add(vote)
        if vote_type == VoteType.UP:
            post.upvotes += 1
        else:
            post.downvotes += 1

    post.score = post.upvotes - post.downvotes
    db.commit()

    return {
        "score": post.score,
        "upvotes": post.upvotes,
        "downvotes": post.downvotes,
    }


# ============== Comments ==============

@router.post("/posts/{post_id}/comments")
def create_comment(
    post_id: int,
    content: str,
    parent_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Create a comment."""
    post = db.query(CommunityPost).filter(CommunityPost.id == post_id).first()

    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    if post.is_locked:
        raise HTTPException(status_code=403, detail="Post is locked")

    comment = CommunityComment(
        post_id=post_id,
        author_id=current_user.id,
        content=content,
        parent_id=parent_id,
    )

    db.add(comment)
    post.comment_count += 1
    db.commit()

    return {
        "id": comment.id,
        "message": "Comment created",
    }


@router.post("/comments/{comment_id}/vote")
def vote_comment(
    comment_id: int,
    vote_type: VoteType,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Vote on a comment."""
    comment = db.query(CommunityComment).filter(CommunityComment.id == comment_id).first()

    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    # Similar to post voting
    existing = db.query(CommentVote).filter(
        CommentVote.comment_id == comment_id,
        CommentVote.user_id == current_user.id
    ).first()

    if existing:
        if existing.vote_type == vote_type:
            db.delete(existing)
            if vote_type == VoteType.UP:
                comment.upvotes -= 1
            else:
                comment.downvotes -= 1
        else:
            old_type = existing.vote_type
            existing.vote_type = vote_type
            if old_type == VoteType.UP:
                comment.upvotes -= 1
                comment.downvotes += 1
            else:
                comment.downvotes -= 1
                comment.upvotes += 1
    else:
        vote = CommentVote(
            comment_id=comment_id,
            user_id=current_user.id,
            vote_type=vote_type,
        )
        db.add(vote)
        if vote_type == VoteType.UP:
            comment.upvotes += 1
        else:
            comment.downvotes += 1

    comment.score = comment.upvotes - comment.downvotes
    db.commit()

    return {
        "score": comment.score,
        "upvotes": comment.upvotes,
        "downvotes": comment.downvotes,
    }


# ============== Saved Posts ==============

@router.get("/saved")
def get_saved_posts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Get user's saved posts."""
    saved = db.query(SavedPost).filter(
        SavedPost.user_id == current_user.id
    ).order_by(desc(SavedPost.saved_at)).all()

    return [
        {
            "post_id": s.post_id,
            "title": s.post.title if hasattr(s, 'post') else None,
            "saved_at": s.saved_at.isoformat(),
        }
        for s in saved
    ]


@router.post("/posts/{post_id}/save")
def save_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Save/bookmark a post."""
    existing = db.query(SavedPost).filter(
        SavedPost.user_id == current_user.id,
        SavedPost.post_id == post_id
    ).first()

    if existing:
        db.delete(existing)
        db.commit()
        return {"message": "Unsaved"}

    saved = SavedPost(user_id=current_user.id, post_id=post_id)
    db.add(saved)
    db.commit()

    return {"message": "Saved"}
