# Oakland Food Deals - AWS Deployment Plan

**Last Updated:** December 23, 2024
**Status:** Planning Phase

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
┌─────────────────┐
│   CloudFront    │ (CDN - FREE)
│      (CDN)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    S3 Bucket    │ (Static Next.js - FREE)
│  (Next.js SSG)  │ 5GB storage, minimal traffic
└─────────────────┘
         │
         │ API Calls (https://api.oaklandfooddeals.com)
         ▼
┌─────────────────┐
│  EC2 t2.micro   │ (FREE - 750 hours/month)
│  Docker Compose │ • FastAPI container
│    + Nginx      │ • Nginx reverse proxy
└────────┬────────┘ • Automated deployments
         │
         ▼
┌─────────────────┐
│  RDS Postgres   │ (FREE - 750 hours/month)
│  db.t3.micro    │ 20GB storage
└─────────────────┘
```

**Key Technologies:**
- **Next.js Static Export:** Build to static HTML/CSS/JS files
- **Docker:** FastAPI runs in container on EC2
- **Terraform:** All infrastructure defined as code
- **GitHub Actions:** Auto-deploy on git push to main

**Cost:** $0/month (within free tier limits)

**AWS Services:**
- S3 (Static hosting)
- CloudFront (CDN)
- EC2 t2.micro (1 instance, 750 hrs = 24/7)
- RDS db.t3.micro (750 hrs = 24/7)
- Security Groups, IAM roles

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

### Static Export Configuration

To deploy Next.js to S3, we need to configure static export:

```typescript
// next.config.js
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true, // Required for static export
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  trailingSlash: true, // Better S3 compatibility
}
```

**What We Keep:**
- All React components and UI
- Client-side routing
- API calls to FastAPI backend
- All current functionality

**What We Lose (Not Used Anyway):**
- Server-side rendering (SSR)
- Incremental Static Regeneration (ISR)
- Next.js API routes (using FastAPI instead)
- Middleware
- Image optimization

**Why This Works:**
Our app is a dynamic, user-generated content platform. We don't need SSR because:
- Content is submitted by users, not pre-rendered
- No SEO benefit from server rendering
- All data fetched from API on client side
- Static export is simpler and cheaper to host

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

### Docker Compose (Local Development)

```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/oakland_food_deals
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      POSTGRES_DB: oakland_food_deals
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

---

## Deployment Timeline

### Week 1-2: Phase 1 Setup
- [ ] Dockerize FastAPI backend
- [ ] Configure Next.js for static export
- [ ] Write Terraform for production infrastructure
- [ ] Set up GitHub Actions CI/CD
- [ ] Deploy to AWS
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
2. Update project overview with actual tech stack
3. Create Dockerfile for FastAPI
4. Configure Next.js for static export
5. Test local Docker Compose setup

### Short-term (Next 1-2 Weeks)
1. Write Terraform for Phase 1
2. Set up AWS account and configure IAM
3. Create GitHub Actions workflows
4. Deploy Phase 1 to AWS
5. Configure monitoring and alerts

### Medium-term (Next Month)
1. Harden production deployment
2. Write Phase 2 Terraform
3. Stand up ECS environment for learning
4. Document and tear down Phase 2
5. Update portfolio and resume

---

## Questions & Decisions Log

### Decisions Made
- ✅ Use dual deployment strategy (Phase 1 free, Phase 2 learning)
- ✅ Next.js static export for frontend (not SSR)
- ✅ Docker for containerization
- ✅ Terraform for IaC
- ✅ GitHub Actions for CI/CD
- ✅ Stay within free tier for Phase 1
- ✅ Small investment ($2) for Phase 2 ECS learning

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
