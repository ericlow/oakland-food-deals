  variable "aws_region" {
    description = "AWS region for resources"
    type        = string
    default     = "us-east-1"
  }

  variable "project_name" {
    description = "Project name for resource naming"
    type        = string
    default     = "oakland-food-deals"
  }

  variable "environment" {
    description = "Environment (production, staging, dev)"
    type        = string
    default     = "production"
  }

  variable "db_username" {
    description = "Database master username"
    type        = string
    default     = "postgres"
    sensitive   = true
  }

  variable "db_password" {
    description = "Database master password"
    type        = string
    sensitive   = true
  }

  variable "ec2_instance_type" {
    description = "EC2 instance type"
    type        = string
    default     = "t3.micro"
  }

  variable "db_instance_class" {
    description = "RDS instance class"
    type        = string
    default     = "db.t3.micro"
  }

  variable "my_ip" {
    description = "Your IP address for SSH access (CIDR notation)"
    type        = string
  }


