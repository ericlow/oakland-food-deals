# Get latest Amazon Linux 2 AMI
  data "aws_ami" "amazon_linux_2" {
    most_recent = true
    owners      = ["amazon"]

    filter {
      name   = "name"
      values = ["amzn2-ami-hvm-*-x86_64-gp2"]
    }

    filter {
      name   = "virtualization-type"
      values = ["hvm"]
    }
  }

  # Key Pair for SSH access
  resource "aws_key_pair" "main" {
    key_name   = "${var.project_name}-key"
    public_key = file("~/.ssh/id_ed25519.pub")

    tags = {
      Name = "${var.project_name}-key"
    }
  }

  # EC2 Instance
  resource "aws_instance" "web" {
    ami                    = data.aws_ami.amazon_linux_2.id
    instance_type          = var.ec2_instance_type
    subnet_id              = aws_subnet.public.id
    vpc_security_group_ids = [aws_security_group.ec2.id]
    key_name               = aws_key_pair.main.key_name

    user_data = <<-EOF
                #!/bin/bash
                # Update system
                yum update -y

                # Install Docker
                amazon-linux-extras install docker -y

                # Start Docker service
                systemctl start docker
                systemctl enable docker

                # Add ec2-user to docker group
                usermod -a -G docker ec2-user

                # Install Docker Compose
                curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
                chmod +x /usr/local/bin/docker-compose

		# Install Certbot for SSL certificates
		yum install -y certbot python3-certbox-nginx

		# Log completion
		echo "User data script completed at $(date)" >> /var/log/user-data.log
                EOF

    tags = {
      Name = "${var.project_name}-web-server"
    }
  }
