# Development Log - Oakland Food Deals

## Project State Overview

**Current Status:** January 2026
**Live URL:** https://cheersly.duckdns.org

The **application is fully deployed and running in production** on AWS Free Tier infrastructure with automated CI/CD pipeline. The complete stack (frontend + backend + database) is containerized and deployed on EC2, connected to RDS PostgreSQL, with SSL/TLS and CloudWatch monitoring enabled.

### What We Have

1. **Project Documentation**
   - `Oakland_Food_Deals_Project_Overview.md` - Complete technical specification
   - `AWS_DEPLOYMENT_PLAN.md` - Infrastructure planning and deployment timeline
   - `Agent Guide - AWS Free Tier.md` - AWS-specific learnings and best practices
   - `AGENTS.md` - Working mode and guidelines for Claude Code
   - `CLAUDE.md` - Quick reference for development commands
   - `README.md` - Brief project description
   - `backend/README.md` - Backend API documentation
   - `devlog.md` - Development session history (this file)

2. **Frontend (COMPLETE)**
   - Next.js 16 application with App Router
   - Interactive Google Maps integration (DealsMap)
   - Deals grid view with card components
   - Deal detail pages with dynamic routing
   - Submit deal form with Google Places autocomplete
   - Comments and voting UI
   - Responsive design with Tailwind CSS and Radix UI
   - Production build deployed on EC2

3. **Backend (COMPLETE)**
   - FastAPI application with full REST API
   - SQLAlchemy models: Businesses, Deals, Comments
   - Alembic database migrations
   - Complete CRUD endpoints for all entities
   - Voting system implemented
   - CORS configured for frontend
   - Interactive API docs at /docs endpoint

4. **Infrastructure (COMPLETE)**
   - AWS Free Tier deployment (EC2 t3.micro + RDS db.t3.micro)
   - Docker containerization for frontend, backend, and nginx
   - Terraform infrastructure as code
   - GitHub Actions CI/CD pipeline (auto-deploy on push to main)
   - SSL/TLS via Let's Encrypt (https://cheersly.duckdns.org)
   - CloudWatch monitoring with 6 alarms + SNS email notifications
   - VPC, subnets, security groups, IAM roles
   - RDS PostgreSQL with automated backups

---

## Architecture

### Stack
**Next.js + FastAPI + PostgreSQL**

**Components:**
- **Frontend:** Next.js 16 with App Router, Tailwind CSS, Radix UI, Google Maps
- **Backend:** FastAPI with SQLAlchemy ORM and Alembic migrations
- **Database:** PostgreSQL 18 on RDS
- **Reverse Proxy:** Nginx (routes `/api/*` to backend, everything else to frontend)
- **Hosting:** AWS Free Tier (EC2 t3.micro + RDS db.t3.micro)
- **Deployment:** GitHub Actions CI/CD with Docker containerization

### Deployment Architecture

```
┌─────────────────────────────────────────┐
│         EC2 t3.micro Instance           │
│  ┌───────────────────────────────────┐  │
│  │   Nginx (Port 80/443)             │  │
│  │   SSL/TLS via Let's Encrypt       │  │
│  └─────┬──────────────────────┬──────┘  │
│        │                      │         │
│        ▼                      ▼         │
│  ┌──────────┐          ┌──────────┐    │
│  │ Next.js  │          │ FastAPI  │    │
│  │  :3000   │          │  :8000   │    │
│  │ (Docker) │          │ (Docker) │    │
│  └──────────┘          └──────────┘    │
└─────────────────────────────────────────┘
                   │
                   ▼
         ┌─────────────────┐
         │  RDS PostgreSQL │
         │  db.t3.micro    │
         │  20GB storage   │
         └─────────────────┘
```

### Technology Choices

**Why Next.js:**
- Started as React, upgraded to Next.js for better DX (routing, optimizations)
- App Router with file-based routing
- No SSR needed (content is user-generated, not SEO-focused)
- v0 compatible for React component generation
- Server mode (not static export) for dynamic deal routes

**Why FastAPI:**
- Python backend preferred by developer
- Clean REST API separation for future mobile app
- Automatic OpenAPI documentation
- Fast development with Pydantic validation

**Why PostgreSQL:**
- Relational data with foreign keys (businesses → deals → comments)
- Complex queries with joins
- PostGIS extension available for geographic queries (future)
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

## Next Steps

### Phase 2 Features
- PostGIS extension for geographic queries (future enhancement)
- Duplicate business detection logic (future enhancement)
- Edit permissions system (requires authentication first)
- User authentication system
- Reputation and badges
- Moderator roles
- Instagram integration
- Google Places API integration
- Mobile app
- S3 + CloudFront (Phase 2 ECS deployment - optional)

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

---

### Session: January 4, 2026 - Documentation Review & TODO Cleanup
**Duration:** ~1 hour
**Goal:** Review project documentation and update TODO lists to reflect actual project state

**Completed Tasks:**
- Reviewed all 7 markdown files in root directory (AGENTS.md, AWS_DEPLOYMENT_PLAN.md, Agent Guide - AWS Free Tier.md, CLAUDE.md, Oakland_Food_Deals_Project_Overview.md, README.md, devlog.md)
- Updated devlog.md TODO section to mark completed infrastructure items:
  - Marked SSL/TLS certificates as complete (Step 7)
  - Marked CloudWatch monitoring as complete (Step 7)
- Removed outdated "Next Steps" section (Backend Setup, Development Environment priorities)
- Cleaned up Frontend TODO section:
  - Removed "Routing setup" (Next.js App Router already implemented)
  - Removed "State management" (not needed for MVP - using fetch() in components)
- Discovered frontend is actually complete, not "not_started" as TODO claimed

**Frontend Components Found:**
- deals-map.tsx - Interactive map view with Google Maps
- deals-grid.tsx - Grid layout for deals
- deal-card.tsx - Individual deal display cards
- deal-details.tsx - Full deal detail page
- submit-deal-dialog.tsx - Form for submitting new deals
- submit-deal-button.tsx - Submit button trigger
- comments-section.tsx - Comments and voting UI
- google-places-autocomplete.tsx - Location search integration

**Key Insights:**
- Documentation was significantly out of sync with actual codebase
- Backend: ✅ Complete
- Infrastructure: ✅ Complete (all 7 AWS deployment steps done)
- Frontend: ✅ Complete (full Next.js app with all core features)
- Project is production-ready at https://cheersly.duckdns.org

**Process Improvement:**
- Reinforced requirement to follow AGENTS.md guidelines (fire emoji visual indicators)
- Identified need to keep devlog TODO section synchronized with actual code state

**Status:** Documentation cleanup complete. Project state now accurately reflected in devlog.md
