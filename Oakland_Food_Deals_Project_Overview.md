# Oakland Food Deals
## Project Overview & Architecture

**December 2024**

---

## Executive Summary

Oakland Food Deals is a community-driven platform focused on time-sensitive food deals in Oakland, California. Unlike general review platforms like Yelp, **which don't track happy hour information at all**, this app is purpose-built for time-based deals with structured data for schedules, pricing, and specific menu items. The platform targets value-conscious diners looking for happy hours and breakfast specials, with a focus on deal discovery and community-verified freshness.

---

## Problem Statement

Current challenges in finding food deals:

- **Yelp doesn't have specific happy hour information** - times, prices, and items aren't tracked
- Time-specific deals (breakfast specials, happy hours) have no dedicated discovery platform
- Users must manually check multiple restaurant Instagram accounts for daily specials
- No centralized, community-maintained source for Oakland time-based deals

### Market Validation

The need for centralized happy hour information is not unique to Oakland. Similar gaps exist in nearby areas:

- **San Mateo**: Community members asking for happy hour resources on Reddit ([San Mateo Happy Hours discussion](https://www.reddit.com/r/SanMateo/comments/1jpigf9/happy_hour/))
- **San Jose**: Users seeking happy hour recommendations ([San Jose Happy Hour recommendations](https://www.reddit.com/r/SanJose/comments/1lgj9th/favorite_happy_hour_recommendations/))

This demonstrates broader market demand for structured, community-maintained deal information across the Bay Area.

---

## Solution Overview

Oakland Food Deals provides a specialized platform where community members can submit, update, and verify time-sensitive food deals. The app combines elements from Wikipedia's collaborative editing model with Reddit/StackOverflow's voting and comment systems to ensure information stays fresh and accurate.

### Target Market

- Oakland residents and workers looking for value dining
- Budget-conscious diners and young professionals
- Happy hour enthusiasts
- Local food explorers seeking new deals

### Differentiation from Yelp

- **Yelp has no happy hour data structure** - Oakland Food Deals is built specifically for time-based deals with dedicated fields for hours, days, pricing, and menu items
- Focus on temporal/limited-time offerings rather than general restaurant reviews
- Deal discovery and time-specific value rather than "best restaurant" rankings
- Community-verified freshness through voting and recent confirmations
- Oakland-specific with deep local knowledge of neighborhood deals

---

## Core Features

### Business Profiles

Each restaurant/bar has a single profile containing:

- Name, address, phone number
- Google Place ID for integration
- Multiple deals attached to each business
- Community ratings via upvotes/downvotes
- User comments and reviews

### Deal Management

Deals are structured records attached to businesses:

- Deal type (happy hour, breakfast special, lunch special, etc.)
- Days active (Monday-Friday, specific days)
- Time range (e.g., 3pm-6pm)
- Food and drink items included
- Pricing information
- Tags (taco tuesday, oyster special, industry night)
- Voting and comments at deal level

### Community Engagement

- Three-level comment system: businesses, deals, and comments
- Upvote/downvote functionality for content quality
- Recent confirmations show deal freshness
- Photo uploads for deals and businesses
- Anonymous submissions initially (accounts to be added later)

### Quality Control

- Duplicate prevention: system checks if business already exists
- Only original submitters, moderators, or admins can edit submissions
- Community voting surfaces accurate, helpful content
- Downvoted deals naturally sink, outdated information becomes less visible

---

## Data Model

The application uses a relational database structure with three main entities:

### Businesses Table

| Field | Description |
|-------|-------------|
| **Fields** | id, name, address, phone, google_place_id, website, created_by, created_at, vote_score |
| **Purpose** | Main entity representing restaurants and bars in Oakland |

### Deals Table

| Field | Description |
|-------|-------------|
| **Fields** | id, business_id (FK), deal_type, days_active, time_start, time_end, description, food_items, drink_items, pricing, tags, created_by, created_at, vote_score |
| **Relationship** | Many-to-one with Businesses (multiple deals per business) |

### Comments Table

| Field | Description |
|-------|-------------|
| **Fields** | id, business_id (FK, nullable), deal_id (FK, nullable), text, created_by, created_at, vote_score |
| **Structure** | Polymorphic: can attach to either businesses or deals |

### Data Hierarchy

```
Business: "Tamarindo" [↑ 45 ↓ 2]
  ├─ Comment: "Great vibe!" [↑ 12 ↓ 0]
  ├─ Deal: "Happy Hour" [↑ 23 ↓ 1]
  │   ├─ Comment: "Still active as of Dec 5!" [↑ 8 ↓ 0]
  │   └─ Comment: "Oysters are huge" [↑ 5 ↓ 0]
  └─ Deal: "Weekend Brunch" [↑ 15 ↓ 0]
      └─ Comment: "Mimosas ran out early" [↑ 3 ↓ 1]
```

---

## Architecture Decisions

We evaluated three main architectural approaches before selecting the final stack. The decision was guided by developer preference for Python, simplicity for MVP, and clear separation of concerns.

### Architecture Options Comparison

| Option | Stack | Pros | Cons |
|--------|-------|------|------|
| **1. React + FastAPI** | React frontend, FastAPI backend, PostgreSQL | Simple architecture, Python backend, clear separation, v0 compatible, mobile-ready API | Two deployments, CORS configuration needed |
| **2. Next.js Only** | Next.js with API routes, PostgreSQL | Single codebase, v0 native, fastest to launch, TypeScript end-to-end | Node.js/TypeScript only, harder for mobile app later, complex AWS deployment |
| **3. Next.js + FastAPI** | Next.js frontend, FastAPI backend, PostgreSQL | Python backend, Next.js SSR benefits | Most complex, two frameworks, overkill for MVP, unnecessary SSR overhead |

### Final Decision: React (Next.js) + FastAPI

**Rationale:**

1. **Python Preference:** Developer has strong Python expertise and preference
2. **Simplicity:** Simpler mental model than Next.js + FastAPI for API routes, clearer separation of concerns
3. **No SSR Needed:** The application doesn't require server-side rendering. It's a dynamic, interactive app focused on user submissions and voting, not content-heavy pages requiring SEO optimization. **We use Next.js static export, not SSR**
4. **v0 Compatibility:** v0 can generate React components that work perfectly with this architecture
5. **Future-Proof:** Clean REST API makes it easy to add mobile app later using the same backend
6. **AWS Free Tier:** Deployment architecture fits well within AWS free tier constraints
7. **Next.js Benefits:** We use Next.js as a React framework for better developer experience (routing, built-in optimizations) but export to static files

**Implementation Note:** Originally planned as vanilla React, but implemented with Next.js for improved developer experience. We use static export mode, so it deploys identically to a React SPA (static HTML/CSS/JS files on S3).

---

## Technical Stack

| Component | Technology |
|-----------|------------|
| **Frontend** | Next.js 16 (UI components designed with v0) |
| **Backend** | FastAPI (Python) |
| **Database** | PostgreSQL |
| **ORM** | SQLAlchemy |
| **Containerization** | Docker + Docker Compose |
| **Infrastructure as Code** | Terraform |
| **CI/CD** | GitHub Actions |
| **Hosting - Frontend** | AWS S3 + CloudFront (Next.js static export) |
| **Hosting - Backend** | AWS EC2 t2.micro (Docker container) or ECS Fargate |
| **Hosting - Database** | AWS RDS PostgreSQL db.t3.micro (750 hours free tier) |

**Note:** See [AWS_DEPLOYMENT_PLAN.md](./AWS_DEPLOYMENT_PLAN.md) for detailed deployment strategy and dual-environment approach.

### Why PostgreSQL over DynamoDB

- Relational data with clear foreign key relationships
- Complex queries with joins across businesses, deals, and comments
- Geographic queries for "deals near me" using PostGIS extension
- Full-text search capabilities for business names
- Easy sorting and filtering by votes, time, and location
- Simpler mental model for the data structure

---

## Deployment Architecture

### Dual Deployment Strategy

This project uses a **two-phase deployment approach** to maximize both cost efficiency and learning value:

**Phase 1 - Production (Always Running, $0/month):**
- Next.js static export on S3 + CloudFront
- FastAPI in Docker container on EC2 t2.micro
- RDS PostgreSQL db.t3.micro
- Infrastructure as Code with Terraform
- CI/CD with GitHub Actions

**Phase 2 - Learning Environment (Spin up for 2-3 days, ~$2 total):**
- Same frontend (S3 + CloudFront)
- FastAPI on ECS Fargate with Application Load Balancer
- Container orchestration for enterprise-level experience
- Tear down after learning and documentation

### Phase 1 Architecture (Production)

```
┌─────────────────┐
│   CloudFront    │ (CDN)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    S3 Bucket    │ (Next.js Static Export)
└─────────────────┘
         │
         │ API Calls
         ▼
┌─────────────────┐
│  EC2 t2.micro   │ (Docker + Nginx)
│  FastAPI Docker │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  RDS Postgres   │ (db.t3.micro)
└─────────────────┘
```

**For complete deployment details, architecture diagrams, cost breakdown, and implementation timeline, see [AWS_DEPLOYMENT_PLAN.md](./AWS_DEPLOYMENT_PLAN.md)**

---

## Future Enhancements

### Database Optimizations

#### PostGIS Integration for Efficient Geospatial Queries

**Current State:**
- Using simple `latitude` and `longitude` float fields
- Location queries use `BETWEEN` clauses on lat/long (sequential scan)
- No spatial indexing

**Problem:**
- Inefficient for location-based queries ("happy hours in SOMA at 3pm")
- Linear time complexity on large datasets
- Can't efficiently handle complex polygonal regions (neighborhoods)
- Distance calculations are slow

**Solution: Migrate to PostGIS**
- Install PostGIS extension in RDS
- Add `Geography(POINT)` column with GiST spatial index
- Define neighborhood boundaries as polygons
- Use `ST_Contains()` for "within neighborhood" queries
- Use `ST_DWithin()` for "within X meters" queries

**Benefits:**
- 100-300x faster location queries with spatial indexes
- Support for complex neighborhood polygons (not just rectangles)
- Accurate earth-surface distance calculations
- Industry-standard geospatial solution

**Implementation Steps:**
1. Install PostGIS extension: `CREATE EXTENSION postgis;`
2. Add GeoAlchemy2 to backend dependencies
3. Add `location` column: `Geography(geometry_type='POINT', srid=4326)`
4. Create spatial index: `CREATE INDEX USING GIST(location)`
5. Create neighborhoods table with polygon boundaries
6. Update API queries to use PostGIS functions
7. Update API serialization to handle geography objects

**Estimated Effort:** 4-6 hours
**Resume Value:** High (PostGIS is widely used in production systems)
**Priority:** Medium (current approach works for MVP scale)

---

### Phase 2 Features

- User account system with authentication
- Reputation and badges for top contributors
- Moderator roles and permissions
- Instagram integration for deal aggregation
- Google Places API integration for real-time busyness
- Mobile app using existing FastAPI backend

### Potential Instagram Integration

Many Oakland restaurants post daily specials to Instagram Stories. Future versions could:

- Aggregate Instagram posts with specific hashtags (#oaklandhappyhour, #oaklandfooddeals)
- Partner with restaurants to share their deal posts directly
- Note: Instagram API has restrictions; manual curation may be needed initially

---

## Success Metrics

### MVP Goals

- 50+ businesses with active deals in first 3 months
- 100+ user submissions
- Deals updated/confirmed at least weekly
- Community engagement: 200+ votes and 50+ comments

### Key Differentiator

The primary competitive advantage is that **Yelp doesn't track happy hour information at all**. While Yelp excels at general restaurant reviews and ratings, it has no structured data for time-specific deals (what times, what days, what prices, what items). Oakland Food Deals fills this gap by being purpose-built for temporal deals with dedicated fields for schedules, pricing, and menu items. The community verification system ensures this specialized information stays current and accurate.

---

## Conclusion

Oakland Food Deals addresses a specific market need with a focused solution. By combining community-driven content with voting systems inspired by Reddit and StackOverflow, the platform ensures deal information stays fresh and accurate. The React + FastAPI architecture provides a solid foundation for rapid MVP development while maintaining flexibility for future enhancements including mobile applications and advanced integrations.
