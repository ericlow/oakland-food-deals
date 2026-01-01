# Agent Guide - AWS Free Tier Learnings

**Project:** Oakland Food Deals
**Created:** December 31, 2025
**Purpose:** Document AWS-specific technical learnings from production deployment

---

## Overview

This guide captures AWS-specific behaviors, limitations, and best practices learned during the deployment of the Oakland Food Deals project on AWS Free Tier.

**Key principle:** AWS services are designed for isolation and explicit configuration. Nothing is connected by default.

---

## RDS (Relational Database Service)

### Point-in-Time Restore Behavior

**What Inherits Automatically:**
- ✅ Engine version, instance class, storage type
- ✅ Database name, username, password
- ✅ Parameter groups, option groups
- ✅ Backup settings (retention period, window)
- ✅ Allocated storage, storage encryption

**What Does NOT Inherit:**
- ❌ Network configuration (VPC, subnets, security groups)
- ❌ Multi-AZ setting
- ❌ Deletion protection

**Critical Issue Discovered:**
RDS restore defaults to **default VPC** if `--db-subnet-group-name` is not specified.

**Lesson Learned:**
Always explicitly specify in restore commands:
```bash
aws rds restore-db-instance-to-point-in-time \
  --source-db-instance-identifier original-db \
  --target-db-instance-identifier restored-db \
  --restore-time 2025-12-31T21:58:34Z \
  --db-subnet-group-name your-subnet-group \
  --vpc-security-group-ids sg-xxxxxxxxx \
  --no-publicly-accessible
```

**Pre-Flight Checklist Before Restore:**
1. Verify restore timestamp is within backup retention window
2. Check source database status is "available"
3. Get subnet group name from source database
4. Get VPC security group IDs from source database
5. Verify target instance name doesn't already exist
6. Verify response JSON shows correct VPC ID before waiting

**Restore Timeline:**
- Expected: 10-15 minutes based on data size
- Actual: 25-35 minutes based on **allocated storage** (20 GB)
- State progression: `creating → backing-up → configuring-enhanced-monitoring → available`

**Why Restore Takes Longer:**
- RDS provisions based on allocated storage, not actual data size
- Takes initial backup after restore completes
- Enhanced monitoring configuration adds time

---

## AWS Free Tier Structure

### Two Types of Limits

**1. Resource Limits (Quota-Based):**
- 750 hours/month EC2 t2.micro or t3.micro
- 20 GB General Purpose (SSD) database storage
- 20 GB backup storage
- 5 GB CloudWatch log ingestion/month
- 5 GB CloudWatch log storage

**2. Feature Limits (Hard Gates):**
- ❌ RDS backup retention: **1 day maximum** (not storage-based)
- ❌ RDS enhanced monitoring: **Not available** (must upgrade account)
- ❌ RDS Read replicas: **Not available**
- ❌ Multi-AZ deployments: **Not available**

**Error Pattern:**
```
api error FreeTierRestrictionError: The specified [feature] exceeds
the maximum available to free tier customers. To remove all limitations,
upgrade your account plan.
```

**Critical Lesson:**
Free tier has both quota limits AND feature gates. Terraform won't validate free tier restrictions - you only discover them at `terraform apply` time.

---

## CloudWatch Monitoring

### Default Behavior

**What AWS Collects Automatically:**

**RDS Metrics (Basic Monitoring):**
- 17+ metrics collected (CPU, memory, disk, I/O, connections, latency)
- 5-minute granularity (`MonitoringInterval = 0`)
- Stored for 15 months
- Queryable via CLI or Console
- **No alarms created automatically**
- **No logs exported automatically**

**EC2 Metrics (Basic Monitoring):**
- CPU utilization, disk I/O, network I/O
- 5-minute granularity
- **No detailed monitoring by default** (1-minute would cost money)

**Critical Gap:**
AWS collects metrics but provides **zero observability** out of the box:
- No alarms
- No dashboards
- No log aggregation
- No alerts

**Lesson Learned:**
"Monitoring enabled" ≠ "Monitoring visible". You must explicitly configure alarms, log shipping, and dashboards.

---

### Metrics vs Logs

**Metrics (Numeric Time-Series):**
- Automatically collected
- Examples: CPU %, memory bytes, connection count
- Namespace: `AWS/RDS`, `AWS/EC2`
- Query: `aws cloudwatch get-metric-statistics`
- Free tier: Unlimited basic metrics

**Logs (Text Data):**
- **NOT collected by default**
- Require explicit configuration:
  - RDS: `EnabledCloudwatchLogsExports = ["postgresql"]`
  - EC2: Install CloudWatch agent
- Free tier: 5 GB ingestion + 5 GB storage/month

**Critical Lesson:**
Metrics and logs are separate systems. Both require explicit configuration for visibility.

---

### Enhanced Monitoring Costs

**Basic Monitoring (Free):**
- 5-minute intervals
- Standard metrics (CPU, memory, disk)
- `MonitoringInterval = 0`

**Enhanced Monitoring ($0.30/month):**
- 1-minute intervals
- OS-level metrics (per-process memory, disk I/O details)
- `MonitoringInterval = 60`
- **Not available on free tier**

---

## SNS (Simple Notification Service)

### Email Subscription Workflow

**How It Works:**
1. Create SNS topic via Terraform/API
2. Create subscription with email endpoint
3. Subscription enters "PendingConfirmation" state
4. AWS sends confirmation email to subscriber
5. User must click "Confirm subscription" link
6. Subscription becomes "Confirmed" and active

**Critical Limitation:**
Email confirmation is a **manual step** that cannot be automated (security measure).

**Terraform Behavior:**
```hcl
resource "aws_sns_topic_subscription" "email" {
  topic_arn = aws_sns_topic.main.arn
  protocol  = "email"
  endpoint  = "user@example.com"
}
```

This creates the subscription, but it's **useless until user confirms via email**.

**Best Practice:**
After `terraform apply`, immediately check email and confirm subscription before testing alarms.

---

## Storage Provisioning vs Usage

### RDS Storage Model

**Allocated Storage (What You Provision):**
- Set in Terraform: `allocated_storage = 20` (GB)
- Affects restore time, operational speed
- Free tier: Up to 20 GB

**Actual Usage (What You Consume):**
- Actual data size: <1 GB in our case
- Backup storage based on actual usage
- Free tier: 20 GB backup storage

**Key Insight:**
- Restore time: Based on **allocated** storage (20 GB) → 25-35 minutes
- Backup costs: Based on **actual** data size (<1 GB) → within free tier

---

## Networking Fundamentals

### VPC (Virtual Private Cloud)

**Default VPC:**
- Every AWS account has a default VPC
- Auto-created in each region
- NOT recommended for production

**Custom VPC (Our Setup):**
- Created via Terraform
- Isolated network for our resources
- VPC ID format: `vpc-xxxxxxxxxxxxxxxxx`

**Critical Issue:**
Security groups are **VPC-specific**. Can't attach security group from VPC A to instance in VPC B.

**Error Pattern:**
```
InvalidParameterCombination: The DB instance and EC2 security group
are in different VPCs. The DB instance is in vpc-037d14a8aa63cafe7
and the EC2 security group is in vpc-056d220d586dcde1e
```

**Lesson Learned:**
Always verify VPC ID in JSON response immediately after creating resources. Don't wait 30 minutes to discover wrong VPC.

---

### DB Subnet Groups

**What They Are:**
- Collection of subnets (typically across multiple AZs)
- Defines which VPC and subnets RDS can use
- Required for RDS instances

**Naming Pattern:**
```
{project-name}-db-subnet-group
```

**Critical for Restore:**
Must specify subnet group to ensure restored instance is in correct VPC:
```bash
--db-subnet-group-name oakland-food-deals-db-subnet-group
```

---

### RDS Endpoints

**Endpoint Structure:**
```
{instance-identifier}.{random-string}.{region}.rds.amazonaws.com
```

**Example:**
```
oakland-food-deals-db.carcw404o4ka.us-east-1.rds.amazonaws.com
```

**Restored Instance:**
```
oakland-food-deals-db-restored.carcw404o4ka.us-east-1.rds.amazonaws.com
```

**Critical Limitation:**
- Can't restore "in-place"
- New instance = new endpoint
- Must update application connection string to use restored database
- Original database continues running during restore (zero downtime for verification)

---

## CloudWatch Logs

### Log Group Structure

**Hierarchy:**
```
Log Group (container)
  └─ Log Stream (individual source)
      └─ Log Event (actual log line)
```

**Naming Convention:**
```
/aws/rds/instance/{instance-name}/postgresql
/aws/ec2/{project-name}/backend
/aws/ec2/{project-name}/nginx
```

**Retention Settings:**
Available options: 1, 3, 5, 7, 14, 30, 60, 90, 120, 150, 180, 365, 400, 545, 731, 1827, 3653 days, or never expire.

**Best Practice:**
Set explicit retention (e.g., 7 days) to control costs within free tier.

---

## AWS CLI

### Query Syntax (JMESPath)

**Extract Multiple Fields:**
```bash
--query 'DBInstances[0].[Field1,Field2,Field3]'
```
Returns: Array of values

**Extract Single Field:**
```bash
--query 'DBInstances[0].FieldName'
```
Returns: Single value

**Filter Arrays:**
```bash
--query 'Reservations[0].Instances[0].Tags'
```

**Common Gotcha:**
JMESPath is not SQL. Array indexing syntax:
- `[0]` - First element
- `[*]` - All elements
- `[?condition]` - Filter

---

## RDS Configuration Details

### Parameter Groups vs Option Groups

**Parameter Group:**
- Database configuration settings
- Runtime parameters (max_connections, shared_buffers)
- Example: `default.postgres18`
- **Inherits during restore:** Yes

**Option Group:**
- Additional features/plugins
- Less common for PostgreSQL
- Example: `default:postgres-18`
- **Inherits during restore:** Yes

**Both carry over** during point-in-time restore.

---

## Cost Management

### What's Actually Free

**Free Forever:**
- Basic monitoring (5-minute metrics)
- Standard CloudWatch metrics collection
- First 10 CloudWatch alarms
- First 10 CloudWatch custom metrics

**Free Tier (12 Months):**
- 750 hours/month t2.micro or t3.micro EC2
- 20 GB RDS storage
- 20 GB backup storage
- 5 GB CloudWatch logs ingestion
- 5 GB CloudWatch logs storage

**Costs Money Even on Free Tier:**
- Enhanced RDS monitoring (1-minute): $0.30/month
- RDS backup retention >1 day: Requires account upgrade
- CloudWatch logs beyond 5 GB: $0.50/GB ingestion
- Detailed EC2 monitoring (1-minute): $0.14/instance/month

---

## Observability Anti-Patterns

### Default AWS Behavior

**What Happens by Default:**
- ✅ Backups run automatically
- ✅ Metrics collected automatically
- ❌ No visibility without explicit queries
- ❌ No alerts or notifications
- ❌ No centralized log aggregation
- ❌ No dashboards

**Where Logs Live by Default:**

| Component | Log Location | Access Method |
|-----------|--------------|---------------|
| Backend (FastAPI) | Docker container on EC2 | SSH + `docker logs backend` |
| Frontend (Next.js) | Docker container on EC2 | SSH + `docker logs frontend` |
| Nginx | Docker container on EC2 | SSH + `docker logs nginx` |
| RDS PostgreSQL | RDS instance | Enable export to CloudWatch |

**The Problem:**
Each component's logs are siloed. No centralized searching, filtering, or analysis.

**The Solution:**
Explicitly configure CloudWatch log shipping for centralized observability.

---

## Key Principles for AWS Free Tier

### 1. Explicit Configuration Required

AWS defaults are designed to:
- Not break
- Not cost money unexpectedly
- Not expose data

But they **do not** provide observability by default.

**You must explicitly configure:**
- Alarms for each metric you care about
- Log shipping for each application component
- SNS topics for notifications
- Dashboards for visualization

---

### 2. Free Tier Has Feature Gates

**Not just quotas:**
Free tier restricts certain features entirely:
- RDS backup retention: 1 day max (not quota-based)
- Enhanced monitoring: Not available
- Read replicas: Not available

**Lesson:**
Check feature availability, not just resource quotas.

---

### 3. Network Isolation is Strict

**Security groups are VPC-specific:**
- Can't share between VPCs
- Must verify VPC ID when creating resources
- Wrong VPC = 30+ minutes wasted waiting for unusable resource

**Best Practice:**
Always verify VPC ID in response JSON immediately after creating resources.

---

### 4. Restore is Not In-Place

**RDS restore creates new instance:**
- Different endpoint
- Different instance ID
- Original continues running
- Must update application connection string

**Benefit:** Zero-risk verification before switching over

**Tradeoff:** Manual endpoint update required

---

### 5. Provisioned vs Consumed

**Understand the difference:**

| Resource | Provisioned | Consumed | Affects |
|----------|------------|----------|---------|
| RDS Storage | 20 GB | <1 GB | Restore time, operational speed |
| RDS Backups | - | <1 GB | Storage costs |
| EC2 Instance | t3.micro | Variable | Compute costs |

---

## Checklist: Before Every RDS Restore

```bash
# 1. Verify restore window
aws rds describe-db-instance-automated-backups \
  --db-instance-identifier SOURCE_DB \
  --query 'DBInstanceAutomatedBackups[0].[RestoreWindow.EarliestTime,RestoreWindow.LatestTime]'

# 2. Confirm source database is available
aws rds describe-db-instances \
  --db-instance-identifier SOURCE_DB \
  --query 'DBInstances[0].DBInstanceStatus'

# 3. Get network configuration
aws rds describe-db-instances \
  --db-instance-identifier SOURCE_DB \
  --query 'DBInstances[0].[DBSubnetGroup.DBSubnetGroupName,VpcSecurityGroups[0].VpcSecurityGroupId,DBSubnetGroup.VpcId]'

# 4. Verify target name is available
aws rds describe-db-instances \
  --db-instance-identifier TARGET_DB 2>&1 | \
  grep -q "DBInstanceNotFound" && echo "Name available" || echo "Name exists"

# 5. Run restore with explicit parameters
aws rds restore-db-instance-to-point-in-time \
  --source-db-instance-identifier SOURCE_DB \
  --target-db-instance-identifier TARGET_DB \
  --restore-time YYYY-MM-DDTHH:MM:SSZ \
  --db-subnet-group-name SUBNET_GROUP_NAME \
  --vpc-security-group-ids sg-xxxxxxxxx \
  --no-publicly-accessible

# 6. IMMEDIATELY verify VPC in response JSON
# Look for: "VpcId": "vpc-xxxxxxxx"
# Confirm it matches your application VPC
```

---

## Common Error Messages

### FreeTierRestrictionError

```
api error FreeTierRestrictionError: The specified backup retention
period exceeds the maximum available to free tier customers.
```

**Cause:** Trying to set backup retention >1 day on free tier
**Solution:** Keep `backup_retention_period = 1` or upgrade account

---

### InvalidParameterCombination (VPC Mismatch)

```
InvalidParameterCombination: The DB instance and EC2 security group
are in different VPCs.
```

**Cause:** Trying to attach security group from different VPC
**Solution:** Verify VPC IDs match, use correct subnet group

---

### DBInstanceNotFound

```
An error occurred (DBInstanceNotFound) when calling the
DescribeDBInstances operation: DBInstance not found
```

**Cause:** Instance doesn't exist or fully deleted
**Good when:** Verifying deletion completed
**Bad when:** Trying to query existing instance (check identifier spelling)

---

### InvalidInstanceID.Malformed

```
An error occurred (InvalidInstanceID.Malformed) when calling the
DescribeInstances operation: Invalid id: "None"
```

**Cause:** EC2 query returned None (instance not found with filter)
**Solution:** Verify tag names and values match actual EC2 tags

---

## Version History

**v1.0 - December 31, 2025**
- Initial documentation
- Based on production deployment experience
- Covers RDS, CloudWatch, networking, free tier limitations

---

## Related Documentation

- `AGENTS.md` - Agent working mode and guidelines
- `devlog.md` - Development session history
- `AWS_DEPLOYMENT_PLAN.md` - Infrastructure planning and time tracking
- `Oakland_Food_Deals_Project_Overview.md` - Project architecture
