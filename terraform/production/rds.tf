# DB Subnet Group (required for RDS)
  resource "aws_db_subnet_group" "main" {
    name       = "${var.project_name}-db-subnet-group"
    subnet_ids = [aws_subnet.private.id, aws_subnet.private_2.id]

    tags = {
      Name = "${var.project_name}-db-subnet-group"
    }
  }

  # RDS PostgreSQL Instance
  resource "aws_db_instance" "main" {
    identifier = "${var.project_name}-db"

    # Engine configuration
    engine               = "postgres"
    engine_version       = "18.1"
    instance_class       = var.db_instance_class
    allocated_storage    = 20
    max_allocated_storage = 100
    storage_type         = "gp3"
    storage_encrypted    = true

    # Database credentials
    db_name  = "oakland_food_deals"
    username = var.db_username
    password = var.db_password

    # Network configuration
    db_subnet_group_name   = aws_db_subnet_group.main.name
    vpc_security_group_ids = [aws_security_group.rds.id]
    publicly_accessible    = false

    # Backup configuration
    backup_retention_period = 1
    backup_window          = "03:00-04:00"
    maintenance_window     = "sun:04:00-sun:05:00"

    # Additional settings
    skip_final_snapshot       = true
    final_snapshot_identifier = "${var.project_name}-final-snapshot"
    deletion_protection       = false

    tags = {
      Name = "${var.project_name}-database"
    }
  }
