# Oakland Food Deals - Backend API

FastAPI backend for the Oakland Food Deals platform.

## Tech Stack

- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - ORM for database operations
- **PostgreSQL** - Relational database
- **Alembic** - Database migrations
- **Pydantic** - Data validation and serialization

## Setup

### Prerequisites

- Python 3.11+
- PostgreSQL running on Docker (localhost:5432)
- Database: `oakland_food_deals`

### Installation

1. Create and activate virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

4. Run database migrations:
```bash
alembic upgrade head
```

### Running the Server

```bash
./run.sh
# Or manually:
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- API: http://localhost:8000
- Interactive docs (Swagger): http://localhost:8000/docs
- Alternative docs (ReDoc): http://localhost:8000/redoc

## API Endpoints

### Businesses

- `POST /businesses/` - Create a new business
- `GET /businesses/` - List all businesses
- `GET /businesses/{id}` - Get business by ID
- `PUT /businesses/{id}` - Update business
- `DELETE /businesses/{id}` - Delete business
- `POST /businesses/{id}/vote` - Vote on business (+1 or -1)

### Deals

- `POST /deals/` - Create a new deal
- `GET /deals/` - List all deals (optional: filter by business_id)
- `GET /deals/{id}` - Get deal by ID
- `PUT /deals/{id}` - Update deal
- `DELETE /deals/{id}` - Delete deal
- `POST /deals/{id}/vote` - Vote on deal (+1 or -1)

### Comments

- `POST /comments/` - Create a new comment
- `GET /comments/` - List all comments (optional: filter by business_id or deal_id)
- `GET /comments/{id}` - Get comment by ID
- `PUT /comments/{id}` - Update comment
- `DELETE /comments/{id}` - Delete comment
- `POST /comments/{id}/vote` - Vote on comment (+1 or -1)

## Database Migrations

Create a new migration after model changes:
```bash
alembic revision --autogenerate -m "Description of changes"
```

Apply migrations:
```bash
alembic upgrade head
```

Rollback migration:
```bash
alembic downgrade -1
```

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py         # FastAPI application and routes
│   ├── models.py       # SQLAlchemy database models
│   ├── schemas.py      # Pydantic schemas for validation
│   ├── crud.py         # Database operations
│   └── database.py     # Database connection setup
├── alembic/            # Database migrations
├── venv/               # Virtual environment
├── .env                # Environment variables (not in git)
├── .env.example        # Example environment file
├── requirements.txt    # Python dependencies
├── alembic.ini         # Alembic configuration
└── run.sh              # Server startup script
```

## Example Usage

### Create a Business
```bash
curl -X POST http://localhost:8000/businesses/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tamarindo",
    "address": "468 8th St, Oakland, CA 94607",
    "phone": "(510) 444-1944",
    "website": "https://tamarindooakland.com"
  }'
```

### Create a Deal
```bash
curl -X POST http://localhost:8000/deals/ \
  -H "Content-Type: application/json" \
  -d '{
    "business_id": 1,
    "deal_type": "happy_hour",
    "days_active": ["monday", "tuesday", "wednesday", "thursday", "friday"],
    "time_start": "15:00:00",
    "time_end": "18:00:00",
    "description": "Happy hour specials",
    "drink_items": "$5 margaritas, $4 beers",
    "food_items": "$8 tacos, $6 nachos",
    "pricing": "$4-8",
    "tags": ["happy_hour", "drinks"]
  }'
```

### Vote on a Deal
```bash
curl -X POST http://localhost:8000/deals/1/vote \
  -H "Content-Type: application/json" \
  -d '{"vote": 1}'
```

## Development

The API uses FastAPI's auto-reload feature when run with `--reload` flag. Changes to Python files will automatically restart the server.

Visit http://localhost:8000/docs for interactive API documentation where you can test all endpoints.
