#!/bin/bash

ACTION=$1
HOSTNAME=$2

# Function to handle errors and exit
function handle_error {
  echo "Error: $1"
  exit 1
}

# Function to test SSH connection
function test_ssh {
  if ! ssh -o BatchMode=yes -o ConnectTimeout=5 "$HOSTNAME" true; then
    handle_error "SSH connection to $HOSTNAME failed."
  fi
}

# Function to build the app
function build_app {
  if ! sudo docker compose build app; then
    handle_error "Docker Compose build failed."
  fi
}

# Function to save and load Docker image on remote server
function deploy_image {
  if ! sudo docker save aboni/website | bzip2 | pv | ssh "$HOSTNAME" docker load; then
    handle_error "Failed to load Docker image on the remote server."
  fi
}

# Function to restart the service using Docker Compose on the remote server
function restart_service {
  if ! ssh "$HOSTNAME" docker compose -f /root/docker/aboni-website/docker-compose.yml up -d --no-deps app || exit 1; then
    handle_error "Failed to restart the service using Docker Compose."
  fi
}

# Main script logic to perform actions based on the first argument
case $ACTION in
  testconnect)
    test_ssh
    ;;
  build)
    build_app
    ;;
  deploy)
    test_ssh
    deploy_image
    ;;
  restart)
    test_ssh
    restart_service
    ;;
  full)
    test_ssh
    build_app
    deploy_image
    restart_service
    ;;
  *)
    echo "Usage: $0 {tesconnect|build|deploy|restart|full} HOSTNAME"
    exit 1
    ;;
esac

echo "$ACTION completed successfully."


