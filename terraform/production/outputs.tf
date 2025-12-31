  output "ec2_public_ip" {
    description = "Public IP address of EC2 instance"
    value       = aws_instance.web.public_ip
  }

  output "ec2_instance_id" {
    description = "EC2 instance ID"
    value       = aws_instance.web.id
  }

  output "rds_endpoint" {
    description = "RDS database endpoint"
    value       = aws_db_instance.main.endpoint
    sensitive   = true
  }

  output "rds_database_name" {
    description = "Database name"
    value       = aws_db_instance.main.db_name
  }

  output "elastic_ip" {
    description = "Elastic IP address of the EC2 instance"
    value       = aws_eip.web.public_ip
  }
