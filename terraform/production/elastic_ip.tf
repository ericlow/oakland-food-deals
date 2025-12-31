# Elastic IP for EC2 instance (permanent public IP)
resource "aws_eip" "web" {
  domain = "vpc"

  tags = {
    Name = "${var.project_name}-eip"
  }
}

# Associate Elastic IP with EC2 instance
resource "aws_eip_association" "web" {
  instance_id   = aws_instance.web.id
  allocation_id = aws_eip.web.id
}
