# Security Group for EC2 Instance
  resource "aws_security_group" "ec2" {
    name        = "${var.project_name}-ec2-sg"
    description = "Security group for EC2 web server"
    vpc_id      = aws_vpc.main.id

    # HTTP from anywhere
    ingress {
      from_port   = 80
      to_port     = 80
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
      description = "Allow HTTP from anywhere"
    }

    # HTTPS from anywhere
    ingress {
      from_port   = 443
      to_port     = 443
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
      description = "Allow HTTPS from anywhere"
    }

    # SSH from your IP only
    ingress {
      from_port   = 22
      to_port     = 22
      protocol    = "tcp"
      cidr_blocks = [var.my_ip]
      description = "Allow SSH from my IP"
    }

    # Allow all outbound traffic
    egress {
      from_port   = 0
      to_port     = 0
      protocol    = "-1"
      cidr_blocks = ["0.0.0.0/0"]
      description = "Allow all outbound traffic"
    }

    tags = {
      Name = "${var.project_name}-ec2-sg"
    }
  }

  # Security Group for RDS Database
  resource "aws_security_group" "rds" {
    name        = "${var.project_name}-rds-sg"
    description = "Security group for RDS database"
    vpc_id      = aws_vpc.main.id

    # PostgreSQL from EC2 security group only
    ingress {
      from_port       = 5432
      to_port         = 5432
      protocol        = "tcp"
      security_groups = [aws_security_group.ec2.id]
      description     = "Allow PostgreSQL from EC2 instances"
    }

    # Allow all outbound traffic
    egress {
      from_port   = 0
      to_port     = 0
      protocol    = "-1"
      cidr_blocks = ["0.0.0.0/0"]
      description = "Allow all outbound traffic"
    }

    tags = {
      Name = "${var.project_name}-rds-sg"
    }
  }

