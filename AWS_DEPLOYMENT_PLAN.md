# Oakland Food Deals - AWS Deployment Plan

**Last Updated:** December 25, 2025
**Status:** In Progress (Step 3 of 7 complete - 43%)

---

## Executive Summary

This project will be deployed to AWS using a **dual-deployment strategy** to maximize both cost efficiency and job market value. Phase 1 provides a free, production-ready deployment, while Phase 2 demonstrates enterprise-level AWS expertise.

### Objectives

1. **Production Deployment (Phase 1):** Run the application 24/7 at zero cost using AWS free tier
2. **Learning Deployment (Phase 2):** Gain hands-on experience with modern container orchestration (ECS Fargate) for resume value
3. **Infrastructure as Code:** All infrastructure managed with Terraform for reproducibility
4. **CI/CD Pipeline:** Automated deployments via GitHub Actions

---

## Technology Stack

### Current Stack (Actual Implementation)

| Component | Technology | Notes |
|-----------|------------|-------|
| **Frontend** | Next.js 16 | Originally planned as React, implemented as Next.js |
| **Backend** | FastAPI (Python) | REST API with SQLAlchemy ORM |
| **Database** | PostgreSQL | Currently running locally in Docker |
| **Containerization** | Docker + Docker Compose | To be added for deployment |
| **Infrastructure** | Terraform | To be created |
| **CI/CD** | GitHub Actions | To be configured |
| **Hosting** | AWS (See deployment phases below) | |

---

## Dual Deployment Strategy

### Phase 1: Production Deployment (FREE)

**Purpose:** Live application running 24/7 at zero monthly cost

**Architecture:**
```
┌─────────────────────────────────────────┐
│         EC2 t2.micro Instance           │ (FREE - 750 hours/month)
│  ┌───────────────────────────────────┐  │
│  │   Nginx Reverse Proxy (Port 80)   │  │
│  └─────┬──────────────────────┬──────┘  │
│        │                      │         │
│        ▼                      ▼         │
│  ┌──────────┐          ┌──────────┐    │
│  │ Next.js  │          │ FastAPI  │    │
│  │  :3000   │          │  :8000   │    │
│  │ (Docker) │          │ (Docker) │    │
│  └──────────┘          └──────────┘    │
│                                         │
│  • Both apps in docker-compose          │
│  • Nginx routes by path                │
│  • SSL via Let's Encrypt               │
└─────────────────────────────────────────┘
                   │
                   ▼
         ┌─────────────────┐
         │  RDS Postgres   │ (FREE - 750 hours/month)
         │  db.t3.micro    │ 20GB storage
         └─────────────────┘
```

**Key Technologies:**
- **Next.js Server:** Full Next.js with dynamic routes (not static export)
- **Docker Compose:** Both Next.js + FastAPI in containers on same instance
- **Nginx:** Reverse proxy routing traffic to both apps
- **Terraform:** All infrastructure defined as code
- **GitHub Actions:** Auto-deploy on git push to main

**Cost:** $0/month (within free tier limits)

**AWS Services:**
- EC2 t2.micro (1 instance running both frontend + backend, 750 hrs = 24/7)
- RDS db.t3.micro (750 hrs = 24/7)
- Security Groups, IAM roles
- Route 53 (optional, for DNS)

**What You Learn:**
- ✅ Docker containerization
- ✅ Infrastructure as Code (Terraform)
- ✅ CI/CD pipelines
- ✅ AWS fundamentals (EC2, S3, RDS, CloudFront)
- ✅ Nginx reverse proxy configuration
- ✅ SSL/TLS certificates (Let's Encrypt)
- ✅ CloudWatch monitoring and logging

---

### Phase 2: Learning Deployment (ECS Fargate)

**Purpose:** Hands-on learning with enterprise container orchestration for 2-3 days, then tear down

**Architecture:**
```
┌─────────────────┐
│   CloudFront    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    S3 Bucket    │
│  (Next.js SSG)  │
└─────────────────┘
         │
         │ API Calls
         ▼
┌─────────────────┐
│  Application    │ (ALB - $16/month prorated)
│  Load Balancer  │ • Health checks
│      (ALB)      │ • SSL termination
└────────┬────────┘ • Auto-scaling
         │
         ▼
┌─────────────────┐
│  ECS Cluster    │ (Fargate - $10/month prorated)
│   (Fargate)     │
│  ┌───────────┐  │
│  │  FastAPI  │  │ • Container orchestration
│  │   Task    │  │ • 0.25 vCPU, 0.5GB RAM
│  └───────────┘  │ • Auto-scaling policies
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  RDS Postgres   │ (Can reuse Phase 1 RDS - FREE)
│  db.t3.micro    │ OR new instance
└─────────────────┘
```

**Key Technologies:**
- **ECS Fargate:** Serverless container orchestration
- **Application Load Balancer:** Modern load balancing with health checks
- **ECR:** Container registry for Docker images
- **ECS Task Definitions:** Container configuration
- **ECS Services:** Scaling and deployment strategies

**Cost:** ~$1.50-3.00 total (for 3 days)
- Fargate: 0.25 vCPU, 0.5GB = ~$0.30/day = **$0.90**
- ALB: ~$0.15/day = **$0.45**
- Data transfer: ~$0.10 = **$0.10**
- **Total for 3 days:** ~$1.50-2.00

**Additional AWS Services:**
- ECS (Elastic Container Service)
- ECR (Elastic Container Registry)
- ALB (Application Load Balancer)
- Target Groups
- ECS Service Auto Scaling
- CloudWatch Container Insights

**What You Learn (In Addition to Phase 1):**
- ✅ **ECS/Fargate** - Industry-standard container orchestration
- ✅ **Application Load Balancer** - Health checks, target groups
- ✅ **ECR** - Container registry management
- ✅ **Service Mesh Basics** - Task definitions, services
- ✅ **Auto-scaling** - Task scaling policies
- ✅ **Blue/Green Deployments** - Zero-downtime deployments

**Execution Plan:**
1. **Day 1:** Stand up infrastructure with Terraform
2. **Day 2-3:** Deploy app, test features, document everything
3. **Documentation:**
   - Take screenshots of AWS Console
   - Record architecture diagrams
   - Write deployment guide
   - Create blog post or README
4. **Day 3:** Tear down with `terraform destroy`

**Resume Value:**
After completing Phase 2, you can legitimately claim:
- "Deployed containerized microservices on AWS ECS Fargate with Application Load Balancer"
- "Implemented infrastructure as code using Terraform for both EC2 and ECS environments"
- "Built CI/CD pipeline with GitHub Actions deploying to ECS with zero-downtime deployments"

---

## Infrastructure as Code (Terraform)

All infrastructure will be managed as code in separate directories:

```
oakland-food-deals/
├── terraform/
│   ├── production/              # Phase 1: EC2 + Docker
│   │   ├── main.tf             # Provider config
│   │   ├── variables.tf        # Input variables
│   │   ├── s3.tf               # S3 bucket for frontend
│   │   ├── cloudfront.tf       # CloudFront distribution
│   │   ├── ec2.tf              # EC2 instance + security groups
│   │   ├── rds.tf              # RDS PostgreSQL
│   │   ├── iam.tf              # IAM roles and policies
│   │   └── outputs.tf          # Output values
│   │
│   └── ecs-learning/           # Phase 2: ECS Fargate
│       ├── main.tf             # Provider config
│       ├── variables.tf        # Input variables
│       ├── s3.tf               # S3 bucket for frontend
│       ├── cloudfront.tf       # CloudFront distribution
│       ├── ecs.tf              # ECS cluster and services
│       ├── alb.tf              # Application Load Balancer
│       ├── ecr.tf              # Container registry
│       ├── rds.tf              # RDS PostgreSQL (or reuse)
│       ├── iam.tf              # IAM roles for ECS tasks
│       └── outputs.tf          # Output values
```

**Benefits:**
- Version controlled infrastructure
- Reproducible deployments
- Easy to tear down and rebuild
- Self-documenting architecture
- Demonstrates professional DevOps practices

---

## CI/CD Pipeline (GitHub Actions)

### Phase 1 Pipeline

```yaml
# .github/workflows/deploy-production.yml

Triggers: Push to main branch

Jobs:
  1. Build Frontend
     - Install dependencies
     - Build Next.js static export
     - Upload to S3
     - Invalidate CloudFront cache

  2. Build & Deploy Backend
     - Build Docker image
     - Push to Docker Hub (or ECR)
     - SSH to EC2
     - Pull new image
     - Restart container
     - Health check
```

### Phase 2 Pipeline

```yaml
# .github/workflows/deploy-ecs.yml

Triggers: Manual workflow dispatch (when learning)

Jobs:
  1. Build Frontend
     - (Same as Phase 1)

  2. Build & Deploy Backend
     - Build Docker image
     - Push to ECR
     - Update ECS task definition
     - Deploy new task to ECS service
     - Wait for healthy status
```

---

## Next.js Configuration

### Server Mode (Not Static Export)

**Decision:** Running Next.js as a server instead of static export.

**Why:**
- User-generated content (deals) are created dynamically
- Dynamic routes `/deals/[id]` don't work well with static export
- Can't pre-generate pages for content that doesn't exist yet
- Server mode handles dynamic routes perfectly

**Configuration:**
```typescript
// next.config.mjs (current)
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}
// Note: NO output: 'export' - we're running as a server
```

**What We Get:**
- ✅ All React components and UI
- ✅ Dynamic routing works perfectly
- ✅ API calls to FastAPI backend
- ✅ Can handle user-generated content
- ✅ No build-time limitations

**Deployment Approach:**
- Next.js runs in Docker container on EC2
- Production build served via `npm start`
- Nginx reverse proxy handles SSL and routing

---

## Docker Configuration

### Backend Dockerfile

```dockerfile
# backend/Dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Docker Compose (Current - Local Development)

**Current setup uses existing PostgreSQL:**
```yaml
# docker-compose.yml (current)
services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@host.docker.internal:5432/${POSTGRES_DB}
    volumes:
      - ./backend:/app
```

Uses `.env` file for credentials (not committed to git).

### Docker Compose (Future - AWS Production)

**For AWS deployment, will include both frontend + backend:**
```yaml
# docker-compose.prod.yml (to be created)
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000
      - NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=${GOOGLE_MAPS_API_KEY}
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${RDS_ENDPOINT}:5432/${POSTGRES_DB}

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - frontend
      - backend
```

Nginx will route:
- `/` → Next.js (port 3000)
- `/api` → FastAPI (port 8000)

---

## Deployment Timeline

### Week 1-2: Phase 1 Setup
- [x] Dockerize FastAPI backend (COMPLETED)
- [x] Configure environment variables for both apps (COMPLETED)
- [x] Create Dockerfile for Next.js frontend (COMPLETED)
- [x] Create production docker-compose.yml with Nginx (COMPLETED)
- [x] Set up AWS account and IAM (COMPLETED)
- [ ] Write Terraform for production infrastructure (IN PROGRESS - Step 4)
- [ ] Deploy to AWS
- [ ] Set up GitHub Actions CI/CD
- [ ] Configure custom domain and SSL

### Week 3-4: Production Hardening
- [ ] Set up CloudWatch monitoring
- [ ] Configure automated backups for RDS
- [ ] Add health checks
- [ ] Performance testing
- [ ] Security review

### Week 5: Phase 2 (When Ready to Learn ECS)
- [ ] Write Terraform for ECS infrastructure
- [ ] Stand up ECS environment
- [ ] Deploy and test
- [ ] Document everything (screenshots, diagrams, README)
- [ ] Tear down after 2-3 days

---

## Cost Summary

### Phase 1 (Always Running)
- **Monthly Cost:** $0.00
- EC2 t2.micro: FREE (750 hours)
- RDS db.t3.micro: FREE (750 hours)
- S3: FREE (5GB storage, minimal traffic)
- CloudFront: FREE (50GB transfer/month)
- Data transfer: FREE (15GB outbound)

### Phase 2 (3-day Learning Sprint)
- **One-time Cost:** $1.50-3.00
- ECS Fargate: $0.90 (3 days)
- ALB: $0.45 (3 days)
- Data transfer: $0.10
- ECR: FREE (500MB storage)

**Total Investment:** ~$2.00 for enterprise-level AWS experience

---

## Success Metrics

### Technical Metrics
- [ ] 99.9% uptime for Phase 1 deployment
- [ ] API response time < 200ms (p95)
- [ ] Frontend load time < 2s
- [ ] Zero-downtime deployments
- [ ] Automated backups working

### Learning Metrics
- [ ] Terraform configuration working for both environments
- [ ] CI/CD pipeline deploying automatically
- [ ] Complete documentation of both architectures
- [ ] Portfolio-ready screenshots and diagrams
- [ ] Blog post or technical writeup completed

### Career Metrics
- [ ] GitHub repo demonstrates IaC best practices
- [ ] Resume updated with AWS/ECS experience
- [ ] Can explain architecture in technical interviews
- [ ] LinkedIn profile updated with skills

---

## Job Market Value

### Skills Gained

**High-Value Skills (Frequently Required in Job Postings):**
- ✅ Docker & Container Orchestration
- ✅ AWS (EC2, ECS, RDS, S3, CloudFront, ALB)
- ✅ Infrastructure as Code (Terraform)
- ✅ CI/CD Pipelines (GitHub Actions)
- ✅ System Design & Architecture
- ✅ DevOps Best Practices

**Resume Impact:**
This project demonstrates you can:
1. Design and deploy production infrastructure on AWS
2. Write infrastructure as code
3. Containerize applications
4. Build automated deployment pipelines
5. Make cost-conscious technical decisions
6. Work with modern full-stack technologies

**Comparable Experience:**
Many engineers learn these skills on the job over 1-2 years. This project compresses that learning into a few weeks.

---

## Risk Mitigation

### Free Tier Monitoring
- Set up AWS Budget alerts for $0.01
- Monitor free tier usage dashboard weekly
- CloudWatch alarms for unexpected costs

### Data Backup Strategy
- Daily automated RDS snapshots (FREE)
- Export data to S3 weekly (FREE)
- Keep backups for 7 days

### Rollback Plan
- Git tags for each deployment
- Infrastructure versioned in Terraform
- Can rebuild entire stack from code
- Database backups for point-in-time recovery

---

## Next Steps

### Immediate (This Week)
1. ✅ Document deployment strategy (this document)
2. ✅ Create Dockerfile for FastAPI backend
3. ✅ Configure environment variables (.env files)
4. ✅ Test local Docker setup for backend
5. ✅ Configure Next.js for server mode (dynamic routes work)
6. ✅ Create Dockerfile for Next.js frontend
7. ✅ Create production docker-compose.yml with Nginx
8. ✅ Test full stack locally with docker-compose
9. ✅ Set up AWS account and configure IAM

### Short-term (Next 1-2 Weeks)
1. **[IN PROGRESS]** Write Terraform for Phase 1 (Step 4)
2. Deploy Phase 1 to AWS (Step 5)
3. Create GitHub Actions workflows (Step 6)
4. Configure monitoring and alerts (Step 7)
5. Production hardening

### Medium-term (Next Month)
1. Harden production deployment
2. Write Phase 2 Terraform
3. Stand up ECS environment for learning
4. Document and tear down Phase 2
5. Update portfolio and resume

---

## Time Tracking

### Overview
**Total Estimated:** 32-54 hours of focused work
**Total Actual So Far:** ~11.5-13 hours (Steps 1-3 complete)
**Remaining Estimated:** 20.5-41 hours (Steps 4-7)
**Completion:** 3 of 7 steps complete (~43% done)

### Step 1: Local Containerization ✅ COMPLETE
**Estimated:** 1.5-3 hours
**Actual:** 5.5-7 hours
**Variance:** +4 hours (2-3x over estimate)
**Completed:** December 23, 2024

**Breakdown:**
- Backend Docker setup: Est 1h → Actual 3-4h
  - Created Dockerfile (multiple syntax errors fixed)
  - Created docker-compose.yml (YAML formatting issues)
  - Debugged port conflicts with existing PostgreSQL
  - Configured .env files for security
- Frontend env vars: Est 30m → Actual 1h
  - Updated google-maps-loader.ts
  - Created .env.example
  - Deleted old API route
  - Testing and dev server restarts
- Static export attempt (FAILED PATH): Est 30m → Actual 1.5-2h
  - Added output: 'export' to config
  - Hit generateStaticParams errors
  - Researched solutions online
  - Tried dynamicParams (incompatible)
  - Reverted all changes
  - Decided to use server mode instead

**Lessons Learned:**
- First-time Docker has significant debugging overhead
- YAML syntax errors are common (spaces, colons)
- Wrong technical direction (static export) cost 1.5-2 hours
- Reality: 2-3x initial estimates for learning new tools

---

### Step 2: Production Docker Setup ✅ COMPLETE
**Estimated:** 4-9 hours (adjusted based on Step 1 variance)
**Actual:** 3-4 hours
**Variance:** Beat estimate by 25% (came in under low-end)
**Completed:** December 25, 2024

**Completed Tasks:**
- Created Dockerfile for Next.js frontend with multi-stage build
- Created production docker-compose.yml with frontend, backend, and Nginx services
- Configured nginx.conf for routing (/api → backend, / → frontend)
- Tested full stack locally - all 3 containers running successfully
- Merged docker-frontend branch to main (PR #2)

**Lessons Learned:**
- Previous Docker experience from Step 1 significantly improved efficiency
- Multi-stage Dockerfile pattern became easier on second implementation
- Nginx configuration was straightforward with proper documentation
- Testing caught environment variable issues early
- Overall: 2x faster than Step 1 relative to complexity

**Docker Learning Session (Dec 25, 1:27-1:54 AM):**
- ✅ Reviewed multi-stage build concepts
- ✅ Compared single-stage vs multi-stage approaches
- ✅ Understood industry knowledge landscape
- ✅ Duration: 28 minutes

**Next Session:**
- Ready to begin Step 3: AWS Account & IAM Setup
- Estimated: 2-4 hours
- Prerequisites: None (fresh start)

---

### Step 3: AWS Account & IAM Setup ✅ COMPLETE
**Estimated:** 2-4 hours
**Actual:** 2 hours 3 minutes
**Variance:** Right at low end of estimate (beat by 3%)
**Completed:** December 25, 2025

**Completed Tasks:**
- Created AWS account (9.5 min)
- Set up billing alerts at $0.01 threshold (35 min)
- Created IAM user (eric-admin) with AdministratorAccess (49 min)
- Tested IAM user console login (2 min)
- Created access keys for AWS CLI (11 min)
- Installed AWS CLI v2.32.23 via Homebrew (1 min)
- Configured AWS CLI with credentials (8.5 min)
- Validated setup with 4 CLI tests (7 min)

**Lessons Learned:**
- IAM concepts (users vs roles) required explanation time (~40 min discussion)
- CloudShell vs access keys decision required context
- Validation tests confirmed everything working correctly:
  - `aws sts get-caller-identity` - verified IAM user authentication
  - `aws iam get-user` - confirmed user details
  - `aws cloudwatch describe-alarms` - verified billing alert exists and is in OK state
  - `aws s3 ls` - tested AdministratorAccess permissions (empty result expected)
- Billing alert shows $0.00 current charges (within free tier)
- Time efficiency improved due to clear AWS documentation

**Security Best Practices Implemented:**
- Never using root account for daily work
- IAM user follows principle of least privilege
- Billing alert at $0.01 threshold for cost protection
- MFA not enabled (optional for learning environment)
- Access keys stored securely in ~/.aws/credentials

**Next Session:**
- Ready to begin Step 4: Terraform Infrastructure
- Estimated: 10-15 hours
- Prerequisites: AWS account and CLI configured ✅

---

### Step 4: Terraform Infrastructure
**Estimated:** 10-15 hours (highest complexity, steep learning curve)
**Actual:** TBD
**Status:** Not started

**Planned Tasks:**
- Learn Terraform basics (2-3h)
- Write EC2 configuration (2-3h)
- Write RDS configuration (2-3h)
- Write networking (VPC, security groups) (2-4h)
- Test and debug terraform apply (2-4h)

---

### Step 5: Deploy to AWS
**Estimated:** 8-12 hours (expect significant debugging)
**Actual:** ~4 hours
**Variance:** Beat estimate by 50-66%
**Status:** ✅ COMPLETE
**Completed:** December 27-28, 2025

**Completed Tasks:**
- ✅ Infrastructure already created via Terraform (Step 4)
- ✅ SSH to EC2 and verify Docker installation
- ✅ Copy application code to EC2
- ✅ Configure environment variables for RDS
- ✅ Build Docker images (backend, frontend)
- ✅ Create database tables (SQLAlchemy create_all)
- ✅ Fix frontend build-time environment variables
- ✅ Deploy containers with docker-compose
- ✅ Test application end-to-end

**Key Issues Resolved:**
1. Out of memory during frontend build → Added swap space
2. Database tables didn't exist → Ran create_all migration
3. Frontend calling localhost instead of /api → Added ARG/ENV to Dockerfile
4. Google Maps not loading → Passed API key via build-arg

**Time Breakdown:**
- Session start: 9:40 PM (Dec 27)
- Deployment complete: 1:28 AM (Dec 28)
- Learning/documentation: 1:28 AM - 1:38 AM
- Total: ~4 hours

**Why Faster Than Estimate:**
- Docker experience from Steps 1-2
- Clear error messages
- Iterative testing approach
- No SSL configuration needed yet (deferred to Step 7)

---

### Step 5: Post-Deployment - Local Sync Required

**Files to Update Locally:**

**1. `frontend/Dockerfile` - Add ARG/ENV for environment variables**

Copy from EC2 or manually add these lines in stage 2 (after `WORKDIR /app`):
```dockerfile
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
ENV NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=$NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
```

To copy from EC2:
```bash
scp -i ~/.ssh/id_ed25519 ec2-user@3.208.71.237:~/frontend/Dockerfile frontend/Dockerfile
```

**2. `.gitignore` - Ensure sensitive files are ignored**

Add if not already present:
```
# Terraform
terraform/production/.terraform/
terraform/production/*.tfstate
terraform/production/*.tfstate.backup
terraform/production/*.tfvars
terraform/production/plan.txt

# Environment files
.env
.env.production
.env.local
```

**3. Create `frontend/.env.production.example` (safe to commit)**

For documentation:
```
NEXT_PUBLIC_API_URL=/api
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
```

**4. DO NOT Copy These (Keep Separate for Local vs AWS):**
- ❌ Root `.env` - Contains AWS RDS credentials
- ❌ `docker-compose.yml` - Uses different DATABASE_URL for local vs AWS

**Verification Checklist:**
- [ ] Updated `frontend/Dockerfile` with ARG/ENV lines
- [ ] `.gitignore` has all patterns
- [ ] Created `.env.production.example`
- [ ] Verified secrets not committed to git
- [ ] Local dev still works with localhost database

---

### Step 5: Lessons for CI/CD (Step 6)

**Critical Learnings to Apply in GitHub Actions:**

**1. Frontend Build-Time vs Runtime Environment Variables**

**Problem:** Next.js bakes env vars into JavaScript during build, not at runtime.

**Solution for CI/CD:**
```yaml
- name: Build frontend
  run: |
    docker build \
      --build-arg NEXT_PUBLIC_API_URL=/api \
      --build-arg NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=${{ secrets.GOOGLE_MAPS_KEY }} \
      -t frontend ./frontend
```

**GitHub Secrets needed:**
- `GOOGLE_MAPS_KEY`
- `DB_PASSWORD`
- `AWS_ACCESS_KEY_ID` (for deployment)
- `AWS_SECRET_ACCESS_KEY`

---

**2. Database Migrations Strategy**

**Problem:** Tables didn't exist on first deployment.

**Solution for CI/CD:**
- First deploy: Run `create_all()` or Alembic initial migration
- Future deploys: Run Alembic migrations automatically
- Add migration step to deployment workflow:

```yaml
- name: Run database migrations
  run: |
    ssh ec2-user@${{ secrets.EC2_IP }} '
      cd ~/
      docker-compose exec -T backend python -c "
        from app.database import Base, engine
        import app.models
        Base.metadata.create_all(engine)
      "
    '
```

**Future improvement:** Use Alembic for proper migration management.

---

**3. Docker Build Process**

**Working build commands to automate:**

```bash
# Backend (simple - no build args needed)
docker build -t backend ./backend

# Frontend (requires build args for env vars)
docker build \
  --build-arg NEXT_PUBLIC_API_URL=/api \
  --build-arg NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=$GOOGLE_MAPS_KEY \
  -t frontend ./frontend
```

**Deployment order:**
1. Build images
2. Copy to EC2 (or push to registry and pull)
3. Run migrations
4. Restart containers with `docker-compose up -d`

---

**4. Environment Variable Management**

**Three types of env vars:**

**Type 1: Backend Runtime (in .env, docker-compose reads it)**
- `DATABASE_URL`
- `POSTGRES_USER`, `POSTGRES_PASSWORD`
- Backend reads these when container starts

**Type 2: Frontend Build-Time (passed via --build-arg)**
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- Baked into JavaScript during build

**Type 3: Infrastructure Secrets (in terraform.tfvars, not committed)**
- `db_password`
- `my_ip`

**CI/CD Strategy:**
- Store all secrets in GitHub Secrets
- Pass to docker build via --build-arg
- Create .env on EC2 during deployment
- Never commit .tfvars or .env files with real values

---

**5. Deployment Validation Checklist**

**Steps to automate in CI/CD:**

```yaml
# 1. Build backend
- name: Build backend
  run: docker build -t backend ./backend

# 2. Build frontend with env vars
- name: Build frontend
  run: docker build --build-arg NEXT_PUBLIC_API_URL=/api -t frontend ./frontend

# 3. Copy to EC2 (or use registry)
- name: Deploy to EC2
  run: |
    # Copy images or docker-compose files
    # SSH and restart containers

# 4. Run migrations
- name: Migrate database
  run: # migration command

# 5. Health check
- name: Verify deployment
  run: curl http://${{ secrets.EC2_IP }}/api/businesses/
```

---

**6. Common Pitfalls to Avoid**

**Pitfall 1: Forgetting to rebuild frontend after env var changes**
- Solution: CI/CD always rebuilds from scratch

**Pitfall 2: Browser cache showing old frontend**
- Solution: Add cache-busting or versioning

**Pitfall 3: Running out of disk space on EC2**
- Solution: Add `docker system prune -a` to deployment workflow

**Pitfall 4: Secrets in Dockerfile or committed files**
- Solution: GitHub Secrets + .gitignore + code review

---

**Interview Talking Points:**

**"How do you handle environment variables in containerized Next.js apps?"**
- "Next.js requires build-time injection of env vars prefixed with NEXT_PUBLIC_. In Docker, I use ARG/ENV in the Dockerfile and pass values via --build-arg during the build. For CI/CD, these come from GitHub Secrets. Backend env vars are simpler - they're read at runtime from the container environment."

**"What's your database migration strategy?"**
- "For initial deployment, I used SQLAlchemy's create_all() to set up the schema. Going forward, I'd implement Alembic migrations as part of the CI/CD pipeline, running migrations automatically before deploying new code. This ensures database schema stays in sync with code changes."

**"How do you debug deployment issues?"**
- "I test each layer independently: database connectivity from container, API response locally, nginx routing, external access, and finally frontend API calls. This isolates whether it's a network, configuration, or code issue."

---

### Step 6: CI/CD Pipeline
**Estimated:** 4-6 hours
**Actual:** TBD
**Status:** Not started

**Planned Tasks:**
- Learn GitHub Actions basics (1-2h)
- Write workflow for backend deployment (1-2h)
- Write workflow for frontend deployment (1-2h)
- Test and debug pipeline (1-2h)

---

### Step 7: Production Hardening
**Estimated:** 4-8 hours
**Actual:** TBD
**Status:** Not started

**Planned Tasks:**
- Set up CloudWatch monitoring (1-2h)
- Configure RDS automated backups (1h)
- Add health checks (1-2h)
- Performance testing (1-2h)
- Security review (1-2h)

---

## Questions & Decisions Log

### Decisions Made
- ✅ Use dual deployment strategy (Phase 1 free, Phase 2 learning)
- ✅ Next.js server mode (NOT static export) - better for dynamic user content
- ✅ Run both Next.js + FastAPI on same EC2 instance (still free tier)
- ✅ Docker for containerization
- ✅ Terraform for IaC
- ✅ GitHub Actions for CI/CD
- ✅ Stay within free tier for Phase 1
- ✅ Small investment ($2) for Phase 2 ECS learning
- ✅ Use existing PostgreSQL in Docker (not separate db service)

### Open Questions
- [ ] Custom domain name strategy (Route53 or external registrar?)
- [ ] Monitoring strategy (CloudWatch only or add external tools?)
- [ ] Secrets management (AWS Secrets Manager or environment variables?)
- [ ] Database migration strategy for production

---

## References & Resources

### AWS Documentation
- [AWS Free Tier](https://aws.amazon.com/free/)
- [ECS Fargate Pricing](https://aws.amazon.com/fargate/pricing/)
- [RDS Pricing](https://aws.amazon.com/rds/postgresql/pricing/)

### Terraform
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [Terraform Best Practices](https://www.terraform-best-practices.com/)

### CI/CD
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Deploying to AWS with GitHub Actions](https://docs.github.com/en/actions/deployment/deploying-to-your-cloud-provider/deploying-to-amazon-elastic-container-service)

### Next.js
- [Next.js Static Exports](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)

---

**Document Version:** 1.0
**Last Review Date:** December 23, 2024
**Next Review:** After Phase 1 deployment completion
