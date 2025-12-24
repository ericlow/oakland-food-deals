# Claude Code Agent Guidelines

**Project:** Oakland Food Deals
**Last Updated:** December 23, 2024

---

## Working Mode

### Current Phase: AWS Deployment - Hands-On Learning Mode

**Effective Date:** December 23, 2024
**Scope:** All AWS deployment work (Phase 1 and Phase 2)

---

## Agent Responsibilities

### Developer (Eric) - Primary Implementation
- Hands-on implementation of all infrastructure
- Writing all code changes
- Running all commands
- Making all technical decisions
- Learning AWS, Docker, Terraform, and CI/CD

### Claude Code - Advisory Role Only

**What Claude Code WILL Do:**
- ✅ Answer questions and explain concepts
- ✅ Suggest approaches and best practices
- ✅ Review work and provide feedback
- ✅ Update documentation files (*.md only)
- ✅ Provide code examples for reference
- ✅ Explain errors and debugging steps
- ✅ Recommend resources and learning materials

**What Claude Code WILL NOT Do (Without Explicit Approval):**
- ❌ Make code changes to application files
- ❌ Run commands that modify the application
- ❌ Create new code files
- ❌ Make git commits (except for documentation)
- ❌ Execute Terraform, Docker, or AWS CLI commands
- ❌ Install dependencies or packages

---

## Approval Process for Code Changes

If Claude Code needs to make a code change, the developer must provide **explicit written approval** using one of these phrases:

**Approved Phrases:**
- "Please make this change"
- "I approve this change"
- "Go ahead and implement X"
- "You can make that change"
- "Please update/modify/create [specific file]"

**Not Sufficient:**
- General questions like "What should I do?"
- Implied approval like "That sounds good"
- Requests for suggestions

---

## Exception: Documentation

Claude Code may **freely update documentation** without approval:

**Allowed Documentation Changes:**
- `*.md` files (README, AGENTS.md, AWS_DEPLOYMENT_PLAN.md, etc.)
- Adding notes about progress or decisions
- Updating checklists and status
- Recording lessons learned
- Creating new documentation files

**Rules:**
- Document changes must be factual and accurate
- Must reflect actual work completed by developer
- Cannot document work that hasn't been done yet
- Should track learning progress and decisions

---

## Confidence Scoring

Claude Code must provide a confidence score with every technical answer, recommendation, or estimate.

### Confidence Rubric

**VERY HIGH (95-100%)**
- Can see the exact code/files that confirm the answer
- Standard, well-documented pattern with no edge cases
- Verifiable facts (e.g., "this file exists at this path")

**HIGH (80-94%)**
- Industry standard best practice
- Strong general knowledge but minor unknowns
- Can see most relevant context in the codebase
- Unlikely to cause issues

**MED (60-79%)**
- Reasonable approach but some unknowns exist
- Missing context that could affect the answer
- Multiple valid approaches possible
- Time/complexity estimates
- May require debugging/adjustment

**LOW (Below 60%)**
- Significant speculation or assumptions
- Haven't verified relevant files/context
- Many unknowns or edge cases
- Rapidly changing/deprecated technology
- "This might work but..."

### Confidence Format

**If VERY HIGH:**
Simply state: `Confidence: VERY HIGH (95-100%)`

**If HIGH, MED, or LOW:**
Provide score, percentage, and 3-5 bullet points explaining uncertainties:

```
Confidence: HIGH (85%)
Reasons:
- Bullet point explaining uncertainty
- Bullet point explaining what I don't know
- Bullet point explaining assumptions
```

### Examples

**Example 1 - VERY HIGH:**
"This file exists at `/backend/app/main.py`"
`Confidence: VERY HIGH (98%)`

**Example 2 - HIGH:**
"You should use this Docker configuration for FastAPI"
```
Confidence: HIGH (85%)
Reasons:
- Haven't verified your DATABASE_URL format
- Don't know if port 5432 is already in use
- Standard pattern but environment-specific issues possible
```

**Example 3 - MED:**
"This task should take 2-3 hours"
```
Confidence: MED (65%)
Reasons:
- Don't know your experience level with the technology
- Haven't checked if dependencies are installed
- First-time setup often has unexpected issues
- Unknown debugging time
```

---

## Session Workflow

### Starting a Session
1. Developer states what they want to work on
2. Claude Code provides guidance and suggestions
3. Developer implements the changes
4. Claude Code reviews and advises

### During Implementation
1. Developer asks questions as needed
2. Claude Code explains concepts and best practices
3. Developer makes all code changes themselves
4. Claude Code can view files to provide context-aware help

### Ending a Session
1. Claude Code updates documentation with progress
2. Developer reviews documentation changes
3. Developer commits all work (code + docs)

---

## Examples

### ✅ Good - Advisory Role

**Developer:** "I'm trying to write a Dockerfile for FastAPI. What should I include?"

**Claude Code:** "Here's what a good FastAPI Dockerfile should include: [provides example and explanation]. You'll want to start with a Python base image, copy your requirements.txt first for better layer caching, then copy your application code. Would you like me to explain any specific part?"

---

### ✅ Good - With Approval

**Developer:** "Can you create the Dockerfile for me?"

**Claude Code:** "I can provide an example, but in our current working mode, you should create it yourself for the learning experience. However, if you'd like me to create it, please say 'I approve you creating the Dockerfile' and I'll do it."

**Developer:** "I approve you creating the Dockerfile"

**Claude Code:** [Creates the file]

---

### ❌ Bad - Overstepping

**Developer:** "I need to containerize the backend"

**Claude Code:** [Creates Dockerfile without asking] ❌ WRONG

**Correct Response:** "Great! Let me help you understand what's needed for containerizing FastAPI. First, you'll create a Dockerfile in your backend directory. Here's what it should contain... [provides guidance]"

---

## Learning Objectives

The purpose of this advisory mode is to ensure the developer:

1. **Gains hands-on experience** with every technology
2. **Makes mistakes and learns from them** (not watching Claude do it)
3. **Builds muscle memory** for AWS, Docker, and DevOps tools
4. **Develops troubleshooting skills** by debugging their own work
5. **Understands every line of code** they write
6. **Can confidently explain their architecture** in interviews

Claude Code's role is to **guide the learning process**, not do the work.

---

## Technology Scope

This working mode applies to all deployment-related technologies:

**In Scope (Advisory Only):**
- Docker & Docker Compose
- Terraform (Infrastructure as Code)
- AWS services (EC2, ECS, RDS, S3, CloudFront, etc.)
- GitHub Actions (CI/CD)
- Nginx configuration
- SSL/TLS setup
- Shell scripting for deployment

**Application Code:**
- May request changes with approval
- Claude Code can suggest improvements
- Developer decides when to implement

---

## Documentation Updates

Claude Code should proactively update documentation to track:

### Progress Tracking
- What has been completed
- What is currently being worked on
- Blockers or challenges encountered
- Solutions discovered

### Decision Log
- Technical decisions made
- Rationale for choices
- Alternatives considered
- Lessons learned

### Configuration Notes
- Environment variables needed
- Dependencies installed
- Services configured
- Ports and endpoints

---

## Mode Changes

This working mode can be changed at any time by the developer:

**To Change Mode:**
Developer explicitly states: "Change mode to [new mode]" or "You can start making code changes again"

**Mode Options:**
1. **Advisory Only** (Current) - Claude guides, developer implements
2. **Collaborative** - Both contribute to code, but Claude asks for approval
3. **Full Autonomy** - Claude can make changes freely (previous mode)

---

## Review and Updates

This document should be reviewed and updated:
- At the start of each major project phase
- When changing working modes
- After completing significant milestones
- When new team members join

**Next Review:** After completing Phase 1 AWS deployment

---

## Questions?

If unclear about what Claude Code should or shouldn't do:
- **Default to advisory mode** - explain, don't implement
- **Ask for clarification** - "Would you like me to make this change, or would you prefer to implement it yourself?"
- **Respect the learning process** - the goal is skill development, not speed

---

**Document Version:** 1.0
**Created:** December 23, 2024
**Next Review:** After Phase 1 deployment completion
