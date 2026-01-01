# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Oakland Food Deals is a community-driven platform for time-sensitive food deals in Oakland, California. The app uses a **React (Next.js) + FastAPI** architecture with PostgreSQL, deployed on AWS Free Tier infrastructure.

**Key Differentiator:** Unlike Yelp (which doesn't track happy hour data), this platform is purpose-built for time-based deals with structured data for schedules, pricing, and menu items.

## Development Commands

### Backend (FastAPI)

```bash
# From project root
cd backend

# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Database migrations
alembic revision --autogenerate -m "description"
alembic upgrade head
```

### Frontend (Next.js)

```bash
# From project root
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Lint
npm run lint
```

### Docker Development

```bash
# From project root

# Build and run all services
docker-compose up --build

# Run in background
docker-compose up -d

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f nginx

# Stop services
docker-compose down
```

## Architecture

### Three-Tier Stack

**Frontend (Next.js):**
- Uses Next.js static export mode (NOT SSR)
- Exports to static HTML/CSS/JS files
- Radix UI components styled with Tailwind CSS
- Google Maps integration for deal locations

**Backend (FastAPI):**
- RESTful API with automatic OpenAPI documentation
- SQLAlchemy ORM with Alembic migrations
- CORS enabled for local development
- Voting system for businesses, deals, and comments

**Database (PostgreSQL):**
- Three main tables: `businesses`, `deals`, `comments`
- Polymorphic comments (can attach to businesses OR deals)
- Vote scoring on all entities
- Future enhancement: PostGIS for geospatial queries

### Data Model Hierarchy

```
Business (restaurant/bar)
  ├─ Multiple Deals (happy hours, specials)
  │   └─ Comments on specific deals
  └─ Comments on the business itself
```

**Critical Relationships:**
- `deals.business_id` → Foreign key to `businesses.id`
- `comments.business_id` OR `comments.deal_id` → Polymorphic (one must be NULL)
- All entities have `vote_score` for community quality control

### API Patterns

**Standard CRUD for each entity:**
- `POST /{entity}/` - Create
- `GET /{entity}/` - List with pagination
- `GET /{entity}/{id}` - Read single
- `PUT /{entity}/{id}` - Update
- `DELETE /{entity}/{id}` - Delete
- `POST /{entity}/{id}/vote` - Vote (upvote/downvote)

**Special endpoint:**
- `GET /api/deals-enriched` - Joins deals with business data for frontend map display

## AWS Deployment Architecture

### Production Infrastructure (AWS Free Tier)

**Frontend:**
- Next.js static export would deploy to S3 + CloudFront (not yet implemented)
- Currently serving from nginx on EC2

**Backend:**
- EC2 t3.micro running Docker containers
- Three containers: `backend` (FastAPI), `frontend` (Next.js), `nginx` (reverse proxy)
- SSL via Let's Encrypt (automated in CI/CD)
- Nginx routes `/api/*` → backend, everything else → frontend

**Database:**
- RDS PostgreSQL db.t3.micro (20 GB storage)
- Private subnet, no public access
- Automated backups (1-day retention on free tier)

**Infrastructure as Code:**
- Terraform manages all AWS resources in `terraform/production/`
- GitHub Actions handles CI/CD in `.github/workflows/deploy.yml`

### Deployment Workflow

**On push to `main` branch:**
1. Build Docker images locally in GitHub Actions
2. Save images as tarballs and SCP to EC2
3. Load images on EC2 and restart containers
4. Configure/renew SSL certificate with Let's Encrypt
5. Health check via HTTPS

**Required GitHub Secrets:**
- `EC2_SSH_KEY` - SSH private key for EC2 access
- `EC2_HOST` - EC2 public IP or hostname
- `EC2_USER` - Username (ec2-user)
- `POSTGRES_USER`, `DB_PASSWORD`, `POSTGRES_DB` - Database credentials
- `RDS_ENDPOINT` - RDS connection string
- `GOOGLE_MAPS_KEY` - Google Maps API key
- `DOMAIN_NAME` - Domain for SSL (e.g., cheersly.duckdns.org)
- `LETSENCRYPT_EMAIL` - Email for Let's Encrypt notifications

### AWS Free Tier Constraints

**Critical Limitations (See "Agent Guide - AWS Free Tier.md"):**
- RDS backup retention: **1 day maximum** (not configurable on free tier)
- No enhanced monitoring (1-minute granularity)
- No multi-AZ deployments
- 750 hours/month EC2 t3.micro
- 20 GB RDS storage, 20 GB backup storage
- 5 GB CloudWatch logs/month

**RDS Point-in-Time Restore:**
- Restore creates NEW instance with different endpoint
- Must explicitly specify `--db-subnet-group-name` and `--vpc-security-group-ids`
- Defaults to default VPC if not specified (wrong VPC!)
- Restore time ~25-35 minutes based on allocated storage

## Key Configuration Files

**docker-compose.yml:**
- Defines three services: backend, frontend, nginx
- Uses **pre-built images** (not build context) for deployment
- Mounts nginx.conf and SSL certificates
- Environment variables from `.env` file

**nginx.conf:**
- HTTPS redirect on port 80
- SSL/TLS on port 443 with Let's Encrypt certificates
- `/api/` proxy to backend with **prefix stripping** (`proxy_pass http://backend:8000/`)
- Everything else proxies to frontend

**backend/.env (not in repo):**
- `DATABASE_URL` - PostgreSQL connection string with `?sslmode=require`
- Created by GitHub Actions during deployment

## Database Management

### Alembic Migrations

**Location:** `backend/alembic/`

**Create migration:**
```bash
cd backend
alembic revision --autogenerate -m "add latitude longitude to businesses"
```

**Apply migrations:**
```bash
alembic upgrade head
```

**Rollback:**
```bash
alembic downgrade -1
```

### Direct Database Access

**From local machine (requires psql):**
```bash
PGPASSWORD='your-password' psql \
  -h your-rds-endpoint.us-east-1.rds.amazonaws.com \
  -U your-username \
  -d oakland_food_deals \
  -c "SELECT * FROM businesses;"
```

**From EC2 instance:**
```bash
# Install postgresql client first
sudo amazon-linux-extras install -y postgresql14

# Connect
PGPASSWORD='password' psql -h rds-endpoint -U username -d dbname
```

**Important:** Use single quotes around password if it contains special characters.

## Monitoring & Observability

### CloudWatch Setup (In Progress)

**Current State:**
- Basic RDS metrics collected (5-minute granularity)
- No CloudWatch alarms configured
- No log shipping to CloudWatch
- Only local Docker logs accessible via `docker-compose logs`

**Planned Implementation:**
1. SNS topic for email notifications
2. CloudWatch alarms for RDS (CPU, disk, connections)
3. RDS PostgreSQL log export to CloudWatch
4. CloudWatch agent on EC2 for application logs
5. Centralized log aggregation for backend, frontend, nginx

**Note:** See `Agent Guide - AWS Free Tier.md` for complete AWS monitoring details.

### Accessing Logs

**Production (EC2):**
```bash
# SSH to EC2
ssh -i ~/.ssh/id_ed25519 ec2-user@your-ec2-host

# View container logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f nginx
```

**Local Development:**
```bash
# Backend logs (from backend/)
uvicorn app.main:app --reload

# Frontend logs (from frontend/)
npm run dev

# Docker logs (from root)
docker-compose logs -f
```

## Terraform Infrastructure

### Directory Structure

```
terraform/production/
├── main.tf           # Provider and main config
├── variables.tf      # Input variables
├── vpc.tf            # VPC, subnets, route tables
├── security.tf       # Security groups
├── ec2.tf            # EC2 instance with user_data
├── rds.tf            # RDS PostgreSQL instance
├── elastic_ip.tf     # Elastic IP for EC2
└── outputs.tf        # Output values
```

### Common Terraform Commands

```bash
cd terraform/production

# Initialize
terraform init

# Plan changes
terraform plan

# Apply changes
terraform apply

# Destroy infrastructure (careful!)
terraform destroy
```

### Terraform State

- State stored locally (not in S3)
- **Do not commit** `terraform.tfstate` to git
- Contains sensitive data (passwords, IPs)

## Environment Variables

### Backend (.env)

```
DATABASE_URL=postgresql://user:pass@rds-endpoint/dbname?sslmode=require
```

### Frontend (Build-time)

```
NEXT_PUBLIC_API_URL=/api
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-key
```

**Note:** `NEXT_PUBLIC_` prefix required for Next.js client-side access.

## Testing & Quality

### Manual Testing

**API testing:**
```bash
# Health check
curl https://your-domain.com/api/businesses/

# Create business
curl -X POST https://your-domain.com/api/businesses/ \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Bar","address":"123 Main St"}'

# Vote on business
curl -X POST https://your-domain.com/api/businesses/1/vote \
  -H "Content-Type: application/json" \
  -d '{"vote":1}'
```

**Database verification:**
```bash
# Count businesses
PGPASSWORD='pass' psql -h endpoint -U user -d db -c "SELECT COUNT(*) FROM businesses;"
```

### Current Test Coverage

- No automated tests currently implemented
- Manual testing via curl and browser
- Production monitoring via CloudWatch (in progress)

## Common Development Patterns

### Adding a New API Endpoint

1. Define Pydantic schema in `backend/app/schemas.py`
2. Create database model in `backend/app/models.py` (if needed)
3. Implement CRUD operation in `backend/app/crud.py`
4. Add route in `backend/app/main.py`
5. Create Alembic migration if database changes
6. Test with curl or frontend

### Adding a New Frontend Component

1. Create component in `frontend/src/components/`
2. Use Radix UI primitives with Tailwind styling
3. Fetch data from FastAPI backend
4. Handle loading and error states
5. Test in local development

### Database Schema Changes

1. Modify model in `backend/app/models.py`
2. Generate migration: `alembic revision --autogenerate -m "description"`
3. Review generated migration in `backend/alembic/versions/`
4. Apply: `alembic upgrade head`
5. Update Pydantic schemas in `schemas.py`
6. Update CRUD operations if needed

## Security Considerations

### Secrets Management

- **Never commit** `.env`, `terraform.tfvars`, or state files
- Use GitHub Secrets for CI/CD credentials
- Database passwords stored in GitHub Secrets and `.env`
- SSL certificates auto-renewed by Let's Encrypt

### Network Security

- RDS in private subnet, no public access
- EC2 security group allows SSH (port 22), HTTP (80), HTTPS (443)
- RDS security group allows PostgreSQL (5432) only from EC2 security group
- All database connections require SSL (`?sslmode=require`)

### AWS IAM

- EC2 instance does not currently use IAM roles
- Future improvement: Add IAM role for CloudWatch logs, S3 access

## Project Documentation

**Key Documents:**
- `Oakland_Food_Deals_Project_Overview.md` - Full project context and architecture decisions
- `AWS_DEPLOYMENT_PLAN.md` - Detailed deployment strategy and timeline
- `Agent Guide - AWS Free Tier.md` - AWS-specific technical learnings and best practices
- `AGENTS.md` - Working mode and guidelines (for learning/teaching context)
- `devlog.md` - Development session history

## Future Enhancements

### Database (High Value)
- **PostGIS integration** for efficient geospatial queries
  - Add `Geography(POINT)` column with GiST spatial index
  - Define neighborhoods as polygons
  - 100-300x faster location-based queries

### Features (Phase 2)
- User authentication and account system
- Moderator roles and permissions
- Instagram integration for deal aggregation
- Mobile app using existing FastAPI backend

### Infrastructure
- Migrate frontend to S3 + CloudFront
- Add CloudWatch alarms and log aggregation
- Implement automated backups to S3
- Set up staging environment
