from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional

from app import models, schemas, crud
from app.database import engine, get_db

# Default images for deals without custom images
DEFAULT_IMAGES = [
    "/craft-beer-bar-interior-with-taps.jpg",
    "/cocktails-on-bar-with-lake-view.jpg",
    "/fresh-oysters-on-ice-with-lemon.jpg",
    "/wine-glasses-and-cheese-board-cozy-cafe.jpg",
    "/street-tacos-with-margarita-mexican-food.jpg",
    "/sushi-rolls-platter-fresh-fish.jpg",
    "/giant-pizza-slice-new-york-style.jpg",
    "/natural-wine-bottles-elegant-restaurant.jpg",
]

def get_default_image(deal_id: int) -> str:
    """Return a consistent image for a deal based on its ID"""
    return DEFAULT_IMAGES[deal_id % len(DEFAULT_IMAGES)]

app = FastAPI(
    title="Oakland Food Deals API",
    description="API for Oakland Food Deals - community-driven platform for time-sensitive food deals",
    version="1.0.0"
)

# CORS middleware for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "Welcome to Oakland Food Deals API"}


# Business endpoints
@app.post("/businesses/", response_model=schemas.Business, status_code=201)
def create_business(business: schemas.BusinessCreate, db: Session = Depends(get_db)):
    return crud.create_business(db=db, business=business)


@app.get("/businesses/", response_model=List[schemas.Business])
def read_businesses(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    businesses = crud.get_businesses(db, skip=skip, limit=limit)
    return businesses


@app.get("/businesses/{business_id}", response_model=schemas.Business)
def read_business(business_id: int, db: Session = Depends(get_db)):
    db_business = crud.get_business(db, business_id=business_id)
    if db_business is None:
        raise HTTPException(status_code=404, detail="Business not found")
    return db_business


@app.put("/businesses/{business_id}", response_model=schemas.Business)
def update_business(business_id: int, business: schemas.BusinessUpdate, db: Session = Depends(get_db)):
    db_business = crud.update_business(db, business_id=business_id, business=business)
    if db_business is None:
        raise HTTPException(status_code=404, detail="Business not found")
    return db_business


@app.delete("/businesses/{business_id}", status_code=204)
def delete_business(business_id: int, db: Session = Depends(get_db)):
    success = crud.delete_business(db, business_id=business_id)
    if not success:
        raise HTTPException(status_code=404, detail="Business not found")


@app.post("/businesses/{business_id}/vote", response_model=schemas.Business)
def vote_business(business_id: int, vote: schemas.VoteUpdate, db: Session = Depends(get_db)):
    if vote.vote not in [1, -1]:
        raise HTTPException(status_code=400, detail="Vote must be 1 or -1")
    db_business = crud.update_business_vote(db, business_id=business_id, vote=vote.vote)
    if db_business is None:
        raise HTTPException(status_code=404, detail="Business not found")
    return db_business


# Deal endpoints
@app.post("/deals/", response_model=schemas.Deal, status_code=201)
def create_deal(deal: schemas.DealCreate, db: Session = Depends(get_db)):
    return crud.create_deal(db=db, deal=deal)


@app.get("/deals/", response_model=List[schemas.Deal])
def read_deals(skip: int = 0, limit: int = 100, business_id: Optional[int] = None, db: Session = Depends(get_db)):
    deals = crud.get_deals(db, skip=skip, limit=limit, business_id=business_id)
    return deals


@app.get("/deals/{deal_id}", response_model=schemas.Deal)
def read_deal(deal_id: int, db: Session = Depends(get_db)):
    db_deal = crud.get_deal(db, deal_id=deal_id)
    if db_deal is None:
        raise HTTPException(status_code=404, detail="Deal not found")
    return db_deal


@app.put("/deals/{deal_id}", response_model=schemas.Deal)
def update_deal(deal_id: int, deal: schemas.DealUpdate, db: Session = Depends(get_db)):
    db_deal = crud.update_deal(db, deal_id=deal_id, deal=deal)
    if db_deal is None:
        raise HTTPException(status_code=404, detail="Deal not found")
    return db_deal


@app.delete("/deals/{deal_id}", status_code=204)
def delete_deal(deal_id: int, db: Session = Depends(get_db)):
    success = crud.delete_deal(db, deal_id=deal_id)
    if not success:
        raise HTTPException(status_code=404, detail="Deal not found")


@app.post("/deals/{deal_id}/vote", response_model=schemas.Deal)
def vote_deal(deal_id: int, vote: schemas.VoteUpdate, db: Session = Depends(get_db)):
    if vote.vote not in [1, -1]:
        raise HTTPException(status_code=400, detail="Vote must be 1 or -1")
    db_deal = crud.update_deal_vote(db, deal_id=deal_id, vote=vote.vote)
    if db_deal is None:
        raise HTTPException(status_code=404, detail="Deal not found")
    return db_deal


# Comment endpoints
@app.post("/comments/", response_model=schemas.Comment, status_code=201)
def create_comment(comment: schemas.CommentCreate, db: Session = Depends(get_db)):
    if (comment.business_id is None and comment.deal_id is None) or \
       (comment.business_id is not None and comment.deal_id is not None):
        raise HTTPException(status_code=400, detail="Comment must belong to either a business or a deal, not both")
    return crud.create_comment(db=db, comment=comment)


@app.get("/comments/", response_model=List[schemas.Comment])
def read_comments(skip: int = 0, limit: int = 100, business_id: Optional[int] = None,
                 deal_id: Optional[int] = None, db: Session = Depends(get_db)):
    comments = crud.get_comments(db, skip=skip, limit=limit, business_id=business_id, deal_id=deal_id)
    return comments


@app.get("/comments/{comment_id}", response_model=schemas.Comment)
def read_comment(comment_id: int, db: Session = Depends(get_db)):
    db_comment = crud.get_comment(db, comment_id=comment_id)
    if db_comment is None:
        raise HTTPException(status_code=404, detail="Comment not found")
    return db_comment


@app.put("/comments/{comment_id}", response_model=schemas.Comment)
def update_comment(comment_id: int, comment: schemas.CommentUpdate, db: Session = Depends(get_db)):
    db_comment = crud.update_comment(db, comment_id=comment_id, comment=comment)
    if db_comment is None:
        raise HTTPException(status_code=404, detail="Comment not found")
    return db_comment


@app.delete("/comments/{comment_id}", status_code=204)
def delete_comment(comment_id: int, db: Session = Depends(get_db)):
    success = crud.delete_comment(db, comment_id=comment_id)
    if not success:
        raise HTTPException(status_code=404, detail="Comment not found")


@app.post("/comments/{comment_id}/vote", response_model=schemas.Comment)
def vote_comment(comment_id: int, vote: schemas.VoteUpdate, db: Session = Depends(get_db)):
    if vote.vote not in [1, -1]:
        raise HTTPException(status_code=400, detail="Vote must be 1 or -1")
    db_comment = crud.update_comment_vote(db, comment_id=comment_id, vote=vote.vote)
    if db_comment is None:
        raise HTTPException(status_code=404, detail="Comment not found")
    return db_comment


# Enriched deals endpoint - joins deals with business info for frontend
@app.get("/api/deals-enriched")
def get_deals_enriched(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Get deals with business information joined.
    Returns data in format compatible with frontend expectations.
    """
    deals = db.query(models.Deal).offset(skip).limit(limit).all()

    enriched_deals = []
    for deal in deals:
        business = db.query(models.Business).filter(models.Business.id == deal.business_id).first()
        if not business:
            continue

        enriched_deal = {
            "id": deal.id,
            "business_id": business.id,
            "restaurant_name": business.name,
            "deal_description": deal.description or "",
            "schedule": {
                "days": [day.capitalize() for day in (deal.days_active or [])],
                "start_time": str(deal.time_start) if deal.time_start else "",
                "end_time": str(deal.time_end) if deal.time_end else ""
            },
            "vote_count": deal.vote_score,
            "address": business.address,
            "phone": business.phone,
            "google_place_id": business.google_place_id,
            "created_by": deal.created_by,
            "created_at": deal.created_at.isoformat() if deal.created_at else None,
            # Assign image based on deal ID for consistency
            "image_url": get_default_image(deal.id),
            # Location for map - use actual coordinates from business, fallback to Oakland downtown
            "location": {"lat": business.latitude or 37.8044, "lng": business.longitude or -122.2712},
            "neighborhood": None,  # TODO: Add to database later
            # Additional fields that might be useful
            "deal_type": deal.deal_type,
            "food_items": deal.food_items,
            "drink_items": deal.drink_items,
            "pricing": deal.pricing,
            "tags": deal.tags,
            "website": business.website,
        }
        enriched_deals.append(enriched_deal)

    return enriched_deals
