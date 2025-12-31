#!/bin/bash
# User data script for EC2 instance initialization

# Update system packages
yum update -y

# install docker
yum install -y docker
systemctl start docker
systemctl enable docker

# install docker compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# add ec2-user to docker group (allows running docker without sudo)
usermod -aG docker ec2-user

# install certbot for SSL
yum install -y certbot python3-certbot-nginx

# log completion
echo "user data script completed at $(date)" >> /var/log/user-data.log

