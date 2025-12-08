from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, ARRAY, Time, CheckConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Business(Base):
    __tablename__ = "businesses"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    address = Column(String(500))
    phone = Column(String(20))
    google_place_id = Column(String(255), unique=True, index=True)
    website = Column(String(500))
    created_by = Column(String(100))  # Will be user ID later when auth is added
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    vote_score = Column(Integer, default=0)

    # Relationships
    deals = relationship("Deal", back_populates="business", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="business", cascade="all, delete-orphan")


class Deal(Base):
    __tablename__ = "deals"

    id = Column(Integer, primary_key=True, index=True)
    business_id = Column(Integer, ForeignKey("businesses.id"), nullable=False)
    deal_type = Column(String(100), nullable=False)  # 'happy_hour', 'breakfast_special', 'lunch_special', etc.
    days_active = Column(ARRAY(String))  # ['monday', 'tuesday', 'wednesday'] etc.
    time_start = Column(Time)
    time_end = Column(Time)
    description = Column(Text)
    food_items = Column(Text)  # Comma-separated or JSON string
    drink_items = Column(Text)  # Comma-separated or JSON string
    pricing = Column(String(255))
    tags = Column(ARRAY(String))  # ['taco_tuesday', 'oyster_special', 'industry_night']
    created_by = Column(String(100))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    vote_score = Column(Integer, default=0)

    # Relationships
    business = relationship("Business", back_populates="deals")
    comments = relationship("Comment", back_populates="deal", cascade="all, delete-orphan")


class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    business_id = Column(Integer, ForeignKey("businesses.id"), nullable=True)
    deal_id = Column(Integer, ForeignKey("deals.id"), nullable=True)
    text = Column(Text, nullable=False)
    created_by = Column(String(100))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    vote_score = Column(Integer, default=0)

    # Relationships
    business = relationship("Business", back_populates="comments")
    deal = relationship("Deal", back_populates="comments")

    # Constraint: comment must belong to either a business OR a deal, not both or neither
    __table_args__ = (
        CheckConstraint(
            '(business_id IS NOT NULL AND deal_id IS NULL) OR (business_id IS NULL AND deal_id IS NOT NULL)',
            name='comment_belongs_to_business_or_deal'
        ),
    )
