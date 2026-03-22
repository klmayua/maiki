"""Community/Forum models for Reddit-like functionality."""
from datetime import datetime
from enum import Enum as PyEnum

from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum, JSON, Text, Boolean, Table, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class VoteType(PyEnum):
    """Vote types."""
    UP = 1
    DOWN = -1


class PostType(PyEnum):
    """Community post types."""
    TEXT = "text"
    LINK = "link"
    IMAGE = "image"
    VIDEO = "video"
    POLL = "poll"
    JOB = "job"
    SKILL_SHOWCASE = "skill_showcase"


# Association table for community members
community_members = Table(
    "community_members",
    Base.metadata,
    Column("community_id", Integer, ForeignKey("communities.id"), primary_key=True),
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("role", String(50), default="member"),  # member, moderator, admin
    Column("joined_at", DateTime, default=func.now()),
)


class Community(Base):
    """Community/Subreddit model."""
    __tablename__ = "communities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False, index=True)
    slug = Column(String(60), unique=True, nullable=False)
    description = Column(Text, nullable=False)
    rules = Column(JSON, default=list)  # Community rules

    # Settings
    icon_url = Column(String(500), nullable=True)
    banner_url = Column(String(500), nullable=True)
    is_private = Column(Boolean, default=False)
    is_nsfw = Column(Boolean, default=False)
    allow_images = Column(Boolean, default=True)
    allow_polls = Column(Boolean, default=True)

    # Stats
    member_count = Column(Integer, default=0)
    post_count = Column(Integer, default=0)

    # Category (for discovery)
    category = Column(String(50), default="general")  # tech, business, lifestyle, etc

    # Timestamps
    created_at = Column(DateTime, default=func.now())

    # Relationships
    members = relationship("User", secondary=community_members, back_populates="communities")
    posts = relationship("CommunityPost", back_populates="community", lazy="dynamic")
    flairs = relationship("CommunityFlair", back_populates="community")

    def __repr__(self):
        return f"<Community r/{self.name}>"


class CommunityPost(Base):
    """Community post model."""
    __tablename__ = "community_posts"

    id = Column(Integer, primary_key=True, index=True)
    community_id = Column(Integer, ForeignKey("communities.id"), nullable=False)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Content
    title = Column(String(300), nullable=False)
    type = Column(Enum(PostType), default=PostType.TEXT)
    content = Column(Text, nullable=True)  # Text content or description
    url = Column(String(2000), nullable=True)  # For link posts
    media_url = Column(String(500), nullable=True)  # For image/video

    # Engagement
    score = Column(Integer, default=0)  # Upvotes - downvotes
    upvotes = Column(Integer, default=0)
    downvotes = Column(Integer, default=0)
    comment_count = Column(Integer, default=0)
    view_count = Column(Integer, default=0)

    # Status
    is_pinned = Column(Boolean, default=False)
    is_locked = Column(Boolean, default=False)
    is_archived = Column(Boolean, default=False)
    is_nsfw = Column(Boolean, default=False)
    is_spoiler = Column(Boolean, default=False)

    # Awards/Badges
    awards = Column(JSON, default=list)

    # Edited tracking
    edited_at = Column(DateTime, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=func.now())

    # Relationships
    community = relationship("Community", back_populates="posts")
    author = relationship("User", back_populates="posts")
    comments = relationship("CommunityComment", back_populates="post", lazy="dynamic")
    votes = relationship("PostVote", back_populates="post", lazy="dynamic")

    def __repr__(self):
        return f"<Post {self.title[:30]}...>"


class CommunityComment(Base):
    """Community comment model (supports nested)."""
    __tablename__ = "community_comments"

    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("community_posts.id"), nullable=False)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    parent_id = Column(Integer, ForeignKey("community_comments.id"), nullable=True)  # For nested

    # Content
    content = Column(Text, nullable=False)

    # Engagement
    score = Column(Integer, default=0)
    upvotes = Column(Integer, default=0)
    downvotes = Column(Integer, default=0)

    # Awards
    awards = Column(JSON, default=list)
    is_best_answer = Column(Boolean, default=False)  # For Q&A posts

    # Status
    is_edited = Column(Boolean, default=False)
    edited_at = Column(DateTime, nullable=True)
    is_deleted = Column(Boolean, default=False)

    # Timestamps
    created_at = Column(DateTime, default=func.now())

    # Relationships
    post = relationship("CommunityPost", back_populates="comments")
    author = relationship("User", back_populates="comments")
    parent = relationship("CommunityComment", remote_side=[id], back_populates="replies")
    replies = relationship("CommunityComment", back_populates="parent", lazy="dynamic")
    votes = relationship("CommentVote", back_populates="comment", lazy="dynamic")

    def __repr__(self):
        return f"<Comment by {self.author_id}>"


class PostVote(Base):
    """Post vote tracking."""
    __tablename__ = "post_votes"

    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("community_posts.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    vote_type = Column(Enum(VoteType), nullable=False)
    created_at = Column(DateTime, default=func.now())

    # Relationships
    post = relationship("CommunityPost", back_populates="votes")

    __table_args__ = (
        Index("idx_post_vote_unique", "post_id", "user_id", unique=True),
    )


class CommentVote(Base):
    """Comment vote tracking."""
    __tablename__ = "comment_votes"

    id = Column(Integer, primary_key=True, index=True)
    comment_id = Column(Integer, ForeignKey("community_comments.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    vote_type = Column(Enum(VoteType), nullable=False)
    created_at = Column(DateTime, default=func.now())

    # Relationships
    comment = relationship("CommunityComment", back_populates="votes")

    __table_args__ = (
        Index("idx_comment_vote_unique", "comment_id", "user_id", unique=True),
    )


class CommunityFlair(Base):
    """User flairs within a community."""
    __tablename__ = "community_flairs"

    id = Column(Integer, primary_key=True, index=True)
    community_id = Column(Integer, ForeignKey("communities.id"), nullable=False)
    name = Column(String(50), nullable=False)
    color = Column(String(7), default="#3b82f6")  # Hex color
    emoji = Column(String(10), nullable=True)

    # Relationships
    community = relationship("Community", back_populates="flairs")


class UserFlair(Base):
    """User's selected flairs."""
    __tablename__ = "user_flairs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    community_id = Column(Integer, ForeignKey("communities.id"), nullable=False)
    flair_id = Column(Integer, ForeignKey("community_flairs.id"), nullable=False)


class SavedPost(Base):
    """User saved/bookmarked posts."""
    __tablename__ = "saved_posts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    post_id = Column(Integer, ForeignKey("community_posts.id"), nullable=False)
    saved_at = Column(DateTime, default=func.now())

    __table_args__ = (
        Index("idx_saved_unique", "user_id", "post_id", unique=True),
    )


class UserAward(Base):
    """Award/badge system for community."""
    __tablename__ = "user_awards"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)
    description = Column(Text, nullable=False)
    icon_url = Column(String(500), nullable=True)
    cost = Column(Integer, default=0)  # Community points cost
    color = Column(String(7), default="#fbbf24")

    # Can be given to posts, comments, or users
    target_type = Column(String(20), default="any")  # post, comment, user, any


class AwardTransaction(Base):
    """Award giving transactions."""
    __tablename__ = "award_transactions"

    id = Column(Integer, primary_key=True, index=True)
    award_id = Column(Integer, ForeignKey("user_awards.id"), nullable=False)
    giver_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    recipient_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    target_type = Column(String(20), nullable=False)  # post, comment
    target_id = Column(Integer, nullable=False)
    message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=func.now())


class CommunityChallenge(Base):
    """Community challenges/competitions."""
    __tablename__ = "community_challenges"

    id = Column(Integer, primary_key=True, index=True)
    community_id = Column(Integer, ForeignKey("communities.id"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    requirements = Column(JSON, default=list)
    prize_description = Column(Text, nullable=True)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    is_active = Column(Boolean, default=True)
    winner_id = Column(Integer, ForeignKey("users.id"), nullable=True)


# Update User model relationships
from app.models import User

User.posts = relationship("CommunityPost", back_populates="author", lazy="dynamic")
User.comments = relationship("CommunityComment", back_populates="author", lazy="dynamic")
User.communities = relationship("Community", secondary=community_members, back_populates="members")
