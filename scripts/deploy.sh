#!/bin/bash

# Function to handle errors and exit
function handle_error {
  echo "Error: $1"
  exit 1
}

# Test SSH connection
if ! ssh -o BatchMode=yes -o ConnectTimeout=5 $1 exit; then
  handle_error "SSH connection to $1 failed."
fi

# Build the app
if ! sudo docker-compose build app; then
  handle_error "Docker Compose build failed."
fi

# Load the image on the remote server
if ! sudo docker save aboni/website | bzip2 | pv | ssh root@$1 docker load; then
  handle_error "Failed to load Docker image on the remote server."
fi

# SSH into the remote server and restart the service using Docker Compose
if ! ssh root@$1 << 'EOF'
  cd /path/to/your/docker-compose/directory || exit 1
  docker-compose up -d --no-deps --build app || exit 1
EOF
then
  handle_error "Failed to restart the service using Docker Compose."
fi

echo "Deployment completed successfully."
