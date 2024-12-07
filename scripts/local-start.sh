#!/bin/bash

# Default values for HOSTNAME and PORT
HOSTNAME="localhost"
PORT="3024"

# Parse command-line arguments
while [[ $# -gt 0 ]]; do
    key="$1"
    case $key in
        --env=*)
            ENV="${key#*=}"
            shift
            ;;
        -H)
            HOSTNAME="$2"
            shift
            ;;
        -p)
            PORT="$2"
            shift
            ;;
        *)
            # Unknown argument
            echo "Unknown argument: $key"
            exit 1
            ;;
    esac
    shift
done

# Check if --env argument is provided
if [ -z "$ENV" ]; then
    echo "Please provide an environment with --env=<environment>"
    exit 1
fi

# Export HOSTNAME if provided
if [ -n "$HOSTNAME" ]; then
    export HOSTNAME="$HOSTNAME"
fi

# Export PORT if provided
if [ -n "$PORT" ]; then
    export PORT="$PORT"
fi

# Echo different message based on the environment
case $ENV in
    local)
        echo "💻 Running in local environment\n"
        rimraf .next
        vercel env pull .env --environment=Development
        next dev -H $HOSTNAME
        ;;
    ip)
        echo "🦄 Running with IP configuration\n"

        export HOSTNAME=$(ipconfig getifaddr en0);
        export BACKEND_URL=http://${HOSTNAME}:8080
        export NEXT_PUBLIC_APP_URL=http://${HOSTNAME}:${PORT}
        export NEXT_PUBLIC_BACKEND_URL=http://${HOSTNAME}:8080
        export NEXT_PUBLIC_NFT_API_URL=http://${HOSTNAME}:8000
        export NEXT_PUBLIC_GAS_API_URL=http://${HOSTNAME}:8002
        export NEXT_PUBLIC_LEGACY_URL=http://${HOSTNAME}:3014
        
        rimraf .next
        vercel env pull .env --environment=Development
        next dev -H $HOSTNAME
        ;;
    dev)
        echo "🐛 Running in development environment\n"
        rimraf .next
        vercel env pull .env --environment=preview --git-branch=dev
        next dev -H $HOSTNAME
        ;;
    stage)
        echo "🔥 Running in staging environment\n"
        rimraf .next
        vercel env pull .env --environment=preview --git-branch=stagef
        next dev -H $HOSTNAME
        ;;
    prod)
        echo "🚀 Running in production environment\n"
        rimraf .next
        vercel env pull .env --environment=production
        next dev -H $HOSTNAME
        ;;
    *)
        echo "🚫 Invalid environment specified: $ENV\n"
        exit 1
        ;;
esac