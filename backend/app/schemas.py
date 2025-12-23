from pydantic import BaseModel, ConfigDict
from datetime import datetime, time
from typing import Optional


# Business Schemas
class BusinessBase(BaseModel):
    name: str
    address: Optional[str] = None
    phone: Optional[str] = None
    google_place_id: Optional[str] = None
    website: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class BusinessCreate(BusinessBase):
    created_by: str = "anonymous"


class BusinessUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    google_place_id: Optional[str] = None
    website: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class Business(BusinessBase):
    id: int
    created_by: str
    created_at: datetime
    vote_score: int

    model_config = ConfigDict(from_attributes=True)


# Deal Schemas
class DealBase(BaseModel):
    deal_type: str
    days_active: Optional[list[str]] = None
    time_start: Optional[time] = None
    time_end: Optional[time] = None
    description: Optional[str] = None
    food_items: Optional[str] = None
    drink_items: Optional[str] = None
    pricing: Optional[str] = None
    tags: Optional[list[str]] = None
    image_url: Optional[str] = None


class DealCreate(DealBase):
    business_id: int
    created_by: str = "anonymous"


class DealUpdate(BaseModel):
    deal_type: Optional[str] = None
    days_active: Optional[list[str]] = None
    time_start: Optional[time] = None
    time_end: Optional[time] = None
    description: Optional[str] = None
    food_items: Optional[str] = None
    drink_items: Optional[str] = None
    pricing: Optional[str] = None
    tags: Optional[list[str]] = None
    image_url: Optional[str] = None


class Deal(DealBase):
    id: int
    business_id: int
    created_by: str
    created_at: datetime
    vote_score: int

    model_config = ConfigDict(from_attributes=True)


# Comment Schemas
class CommentBase(BaseModel):
    text: str


class CommentCreate(CommentBase):
    business_id: Optional[int] = None
    deal_id: Optional[int] = None
    created_by: str = "anonymous"


class CommentUpdate(BaseModel):
    text: Optional[str] = None


class Comment(CommentBase):
    id: int
    business_id: Optional[int]
    deal_id: Optional[int]
    created_by: str
    created_at: datetime
    vote_score: int

    model_config = ConfigDict(from_attributes=True)


# Vote Schemas
class VoteUpdate(BaseModel):
    vote: int  # +1 for upvote, -1 for downvote
