# Development Log - Oakland Food Deals

## Current Status: Production Deployment Complete with Monitoring & SSL

**Last Updated:** January 1, 2026
**Repository:** oakland-food-deals
**Branch:** main
**Live URL:** https://cheersly.duckdns.org

---

## Project State Overview

The **application is deployed to AWS and running in production** with a fully automated CI/CD pipeline. Both frontend and backend are containerized and deployed on EC2, connected to RDS PostgreSQL.

### What We Have

1. **Project Documentation**
   - `Oakland_Food_Deals_Project_Overview.md` - Complete technical specification
   - `README.md` - Brief project description
   - `backend/README.md` - Backend API documentation
   - `.gitignore` - Standard configuration for Python/Node.js projects

2. **Backend (COMPLETE)**
   - FastAPI application with full REST API
   - SQLAlchemy models: Businesses, Deals, Comments
   - Alembic database migrations
   - PostgreSQL database running on Docker
   - Complete CRUD endpoints for all entities
   - Voting system implemented
   - CORS configured for frontend development
   - Interactive API docs at http://localhost:8000/docs

3. **Git History**
   - 3 commits total
   - **Initial commit (4b38284):** Added `.gitignore` and basic `README.md`
   - **Second commit (75d1c1f):** Added comprehensive project overview document
   - **Third commit (8513ba5):** Complete FastAPI backend implementation

---

## Architecture

### Stack
**React + FastAPI + PostgreSQL**

**Components:**
- Frontend: React
- Backend: FastAPI
- Database: PostgreSQL

### Rationale
- Python backend preferred by developer
- Clean API separation for future mobile app
- No SSR needed (content is user-generated, not SEO-focused)
- v0 compatible for React component generation
- Fits AWS free tier

### Database Choice
**Chosen:** PostgreSQL
**Rejected:** DynamoDB

**Why PostgreSQL:**
- Relational data with foreign keys
- Complex queries with joins
- PostGIS extension for geographic queries
- Full-text search capabilities

---

## Data Model

### Businesses Table
**Description:** Core entity for restaurants/bars
**Relationship:** one-to-many with deals

**Fields:**
- id
- name
- address
- phone
- google_place_id
- website
- created_by
- vote_score

### Deals Table
**Description:** Multiple deals per business
**Relationship:** many-to-one with businesses

**Fields:**
- id
- business_id
- deal_type
- days_active
- time_start
- time_end
- description
- food_items
- drink_items
- pricing
- tags
- vote_score

### Comments Table
**Description:** Polymorphic: can attach to businesses OR deals
**Relationship:** polymorphic

**Fields:**
- id
- business_id (nullable)
- deal_id (nullable)
- text
- created_by
- vote_score

---

## TODO

### Backend
**Status:** COMPLETE

- [x] FastAPI application structure
- [x] SQLAlchemy models (Businesses, Deals, Comments tables)
- [x] Database migrations setup (Alembic)
- [x] Business CRUD operations
- [x] Deal CRUD operations
- [x] Comment CRUD operations
- [x] Voting system endpoints
- [x] PostgreSQL database setup
- [ ] PostGIS extension for geographic queries (future enhancement)
- [ ] Duplicate business detection logic (future enhancement)
- [ ] Edit permissions system (requires authentication first)

### Frontend
**Status:** not_started

- [ ] React application scaffolding
- [ ] Business list/detail views
- [ ] Deal display components
- [ ] Comment/voting UI
- [ ] Submission forms
- [ ] API integration layer
- [ ] Routing setup
- [ ] State management

### Infrastructure
**Status:** COMPLETE (Production Deployment)

- [x] Local development environment setup
- [x] Docker configuration (docker-compose.yml)
- [x] Terraform infrastructure as code
- [x] EC2 t3.micro instance running Docker containers
- [x] RDS PostgreSQL db.t3.micro (production database)
- [x] VPC, subnets, security groups, IAM roles
- [x] GitHub Actions CI/CD pipeline
- [ ] SSL/TLS certificates (Let's Encrypt) - Step 7
- [ ] CloudWatch monitoring - Step 7
- [ ] S3 + CloudFront (Phase 2 ECS deployment - optional)

---

## Next Steps

### Immediate Priorities

**Priority 1: Backend Setup**
- Initialize FastAPI project structure
- Set up PostgreSQL database locally
- Create SQLAlchemy models matching the data model
- Implement basic CRUD endpoints

**Priority 2: Frontend Setup**
- Initialize React application
- Set up routing and basic layout
- Create initial UI components (can use v0 for generation)

**Priority 3: Development Environment**
- Configure database connection
- Set up CORS for local development
- Create seed data for testing

### Phase 2 Features
- User authentication system
- Reputation and badges
- Moderator roles
- Instagram integration
- Google Places API integration
- Mobile app

---

## Project Details

**Target Market:** Oakland residents looking for time-sensitive food deals (happy hours, breakfast specials)

**Key Differentiator:** Yelp doesn't track happy hour information at all - this fills that gap

**Quality Control:** Voting system + edit restrictions (only original submitters, mods, or admins can edit)

**MVP Goal:** 50+ businesses with active deals in first 3 months

---

## Development Sessions

### Session: December 8, 2025 (Part 1 - Planning)
- Reviewed project documentation and git history
- Created this devlog to track development progress
- Confirmed project is in planning phase with no code implementation yet
- Converted devlog from Markdown to TOML format, then back to Markdown

### Session: December 8, 2025 (Part 2 - Backend Implementation)
**Completed full backend implementation:**
- Created backend directory structure with `backend/app/` folder
- Set up Python virtual environment and installed dependencies
- Configured `.env` file with PostgreSQL credentials
- Created SQLAlchemy models for Businesses, Deals, and Comments tables
- Initialized Alembic for database migrations
- Created PostgreSQL database `oakland_food_deals` in Docker
- Generated and applied initial migration (created all tables)
- Implemented Pydantic schemas for request/response validation
- Built CRUD operations for all entities (businesses, deals, comments)
- Created FastAPI application with complete REST API:
  - Business endpoints (GET, POST, PUT, DELETE, VOTE)
  - Deal endpoints (GET, POST, PUT, DELETE, VOTE)
  - Comment endpoints (GET, POST, PUT, DELETE, VOTE)
- Configured CORS middleware for frontend development
- Tested API endpoints successfully:
  - Created test business (Tamarindo)
  - Created test deal (happy hour)
  - Verified voting system works
- Created backend README with API documentation and examples
- API documentation available at http://localhost:8000/docs

**Backend Status:** Fully functional and ready for frontend integration

**Git Commit:**
- Committed all backend code to git (commit 8513ba5)
- Pushed to remote repository on GitHub
- Backend codebase now version controlled and backed up

### Session: December 23-28, 2025 - AWS Infrastructure & Deployment
**Completed AWS infrastructure setup and manual deployment:**
- Step 1: Local containerization (Docker, docker-compose)
- Step 2: Production Docker setup (Nginx reverse proxy)
- Step 3: AWS account and IAM configuration
- Step 4: Terraform infrastructure (VPC, EC2, RDS, Security Groups)
- Step 5: Manual deployment to AWS EC2
- Live application running at http://3.208.71.237

### Session: December 29, 2025 - CI/CD Pipeline Implementation
**Duration:** 12 hours 41 minutes (9:46 AM - 10:27 PM)
**Goal:** Implement automated deployment pipeline via GitHub Actions (Step 6)

**Completed Implementation:**
- Set up 8 GitHub Secrets for AWS credentials and environment variables
- Created `.github/workflows/deploy.yml` with complete deployment workflow
- Implemented Docker image build and tarball transfer strategy
- Configured SSH key-based authentication for GitHub Actions
- Set up automatic .env file generation on EC2 from GitHub Secrets
- Added health check validation and Docker cleanup steps
- Updated EC2 security group to allow GitHub Actions SSH access (0.0.0.0/0)

**Major Issues Resolved:**
1. **YAML Syntax Debugging** - Fixed heredoc delimiters and template substitution errors (multiple iterations)
2. **SSH Security Group** - Opened SSH to 0.0.0.0/0 with key-based auth (standard CI/CD pattern)
3. **Database Password Mismatch** - Synchronized Terraform password with GitHub Secrets
4. **Environment Variable Architecture** - Simplified from 5 variables to 2 (DATABASE_URL, GOOGLE_MAPS_API_KEY)
5. **Malformed DATABASE_URL** - Fixed echo statement bugs (trailing colon, >> vs >, missing port)
6. **Configuration Deployment** - Added docker-compose.yml and nginx.conf to workflow

**Architecture Decisions:**
- GitHub Actions over AWS CodePipeline (simpler, free, config as code)
- Docker tarball strategy instead of registry (no external dependencies)
- Single docker-compose.yml with environment-specific .env files (local vs production)
- Manual database migrations (automated migrations deferred to future work)

**Key Learnings:**
- YAML syntax debugging requires careful attention to quotes and template substitution
- GitHub Actions IP ranges are massive and unpredictable - can't allowlist specific IPs
- Environment variable management spans three systems: Local .env, GitHub Secrets, Terraform
- Password synchronization critical across all systems (Terraform → GitHub Secrets)
- Configuration file deployment as important as code deployment

**Result:**
- ✅ Automated CI/CD pipeline operational
- ✅ Deploys on every push to main branch
- ✅ Health checks validate successful deployment
- ✅ Zero-downtime deployment capability
- ✅ Website live and accessible at http://3.208.71.237

**Time Variance:** 2-3x over original 4-6 hour estimate due to debugging and architectural simplification

**Status:** Step 6 complete. Ready for Step 7 (Production Hardening: SSL/TLS, CloudWatch monitoring)

---

### Session: January 1, 2026 - Step 7: Production Hardening & Monitoring
**Duration:** ~3 hours
**Goal:** Complete Step 7 - CloudWatch monitoring, alarms, and SSL/TLS configuration

**Completed Implementation:**
- Created `monitoring.tf` with CloudWatch log groups (7-day retention)
- Enabled RDS PostgreSQL log export to CloudWatch in `rds.tf`
- Added 6 CloudWatch alarms (4 RDS + 2 EC2) with SNS email notifications
- Imported existing CloudWatch log group into Terraform state
- Verified RDS logs flowing to CloudWatch (checkpoint logs visible)
- Configured SSL/TLS with Let's Encrypt for cheersly.duckdns.org
- Updated nginx.conf for HTTPS with automatic HTTP→HTTPS redirect

**CloudWatch Alarms Created:**
1. RDS CPU utilization (threshold: >80% for 10 min)
2. RDS freeable memory (threshold: <256 MB for 10 min)
3. RDS free storage space (threshold: <2 GB)
4. RDS database connections (threshold: >40 for 10 min)
5. EC2 CPU utilization (threshold: >80% for 10 min)
6. EC2 status check failures

**Key Learnings:**
- CloudWatch log groups = AWS version of /var/log (centralized logging like ELK)
- SNS topics = notification distribution service (pub/sub pattern)
- Free tier: 10 alarms free, 5 GB logs/month free, 1,000 SNS emails/month free
- PostgreSQL default logging is minimal (log_statement = "none") to save storage
- RDS logs take 1-5 minutes to propagate to CloudWatch
- 7-day log retention prevents exceeding 5 GB free tier quota
- Terraform import required for pre-existing CloudWatch resources

**Architecture Decisions:**
- Reused existing `billing-alerts` SNS topic (simpler than creating separate topic)
- 7-day log retention balances debugging capability with free tier limits
- SSL via Let's Encrypt + DuckDNS (both free, no Route53 cost)
- CloudWatch-only monitoring (sufficient for MVP, no external tools needed)

**Challenges Resolved:**
- Log group already existed → used `terraform import` to add to state
- PostgreSQL not logging queries by default → confirmed this is intentional (engine-default)
- Verified logs flowing by checking checkpoint operations

**Result:**
- ✅ Production monitoring complete with 6 alarms + email alerts
- ✅ SSL/TLS configured (https://cheersly.duckdns.org)
- ✅ RDS logs exporting to CloudWatch
- ✅ All within AWS free tier limits
- ✅ Total alarms: 7/10 used (3 free slots remaining)

**Status:** Step 7 complete. Phase 1 AWS deployment fully complete (all 7 steps done)
