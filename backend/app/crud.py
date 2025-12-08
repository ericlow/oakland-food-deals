from sqlalchemy.orm import Session
from app import models, schemas
from typing import Optional


# Business CRUD operations
def get_business(db: Session, business_id: int):
    return db.query(models.Business).filter(models.Business.id == business_id).first()


def get_businesses(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Business).offset(skip).limit(limit).all()


def create_business(db: Session, business: schemas.BusinessCreate):
    db_business = models.Business(**business.model_dump())
    db.add(db_business)
    db.commit()
    db.refresh(db_business)
    return db_business


def update_business(db: Session, business_id: int, business: schemas.BusinessUpdate):
    db_business = get_business(db, business_id)
    if db_business:
        update_data = business.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_business, key, value)
        db.commit()
        db.refresh(db_business)
    return db_business


def delete_business(db: Session, business_id: int):
    db_business = get_business(db, business_id)
    if db_business:
        db.delete(db_business)
        db.commit()
        return True
    return False


def update_business_vote(db: Session, business_id: int, vote: int):
    db_business = get_business(db, business_id)
    if db_business:
        db_business.vote_score += vote
        db.commit()
        db.refresh(db_business)
    return db_business


# Deal CRUD operations
def get_deal(db: Session, deal_id: int):
    return db.query(models.Deal).filter(models.Deal.id == deal_id).first()


def get_deals(db: Session, skip: int = 0, limit: int = 100, business_id: Optional[int] = None):
    query = db.query(models.Deal)
    if business_id:
        query = query.filter(models.Deal.business_id == business_id)
    return query.offset(skip).limit(limit).all()


def create_deal(db: Session, deal: schemas.DealCreate):
    db_deal = models.Deal(**deal.model_dump())
    db.add(db_deal)
    db.commit()
    db.refresh(db_deal)
    return db_deal


def update_deal(db: Session, deal_id: int, deal: schemas.DealUpdate):
    db_deal = get_deal(db, deal_id)
    if db_deal:
        update_data = deal.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_deal, key, value)
        db.commit()
        db.refresh(db_deal)
    return db_deal


def delete_deal(db: Session, deal_id: int):
    db_deal = get_deal(db, deal_id)
    if db_deal:
        db.delete(db_deal)
        db.commit()
        return True
    return False


def update_deal_vote(db: Session, deal_id: int, vote: int):
    db_deal = get_deal(db, deal_id)
    if db_deal:
        db_deal.vote_score += vote
        db.commit()
        db.refresh(db_deal)
    return db_deal


# Comment CRUD operations
def get_comment(db: Session, comment_id: int):
    return db.query(models.Comment).filter(models.Comment.id == comment_id).first()


def get_comments(db: Session, skip: int = 0, limit: int = 100, business_id: Optional[int] = None, deal_id: Optional[int] = None):
    query = db.query(models.Comment)
    if business_id:
        query = query.filter(models.Comment.business_id == business_id)
    if deal_id:
        query = query.filter(models.Comment.deal_id == deal_id)
    return query.offset(skip).limit(limit).all()


def create_comment(db: Session, comment: schemas.CommentCreate):
    db_comment = models.Comment(**comment.model_dump())
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment


def update_comment(db: Session, comment_id: int, comment: schemas.CommentUpdate):
    db_comment = get_comment(db, comment_id)
    if db_comment:
        update_data = comment.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_comment, key, value)
        db.commit()
        db.refresh(db_comment)
    return db_comment


def delete_comment(db: Session, comment_id: int):
    db_comment = get_comment(db, comment_id)
    if db_comment:
        db.delete(db_comment)
        db.commit()
        return True
    return False


def update_comment_vote(db: Session, comment_id: int, vote: int):
    db_comment = get_comment(db, comment_id)
    if db_comment:
        db_comment.vote_score += vote
        db.commit()
        db.refresh(db_comment)
    return db_comment
