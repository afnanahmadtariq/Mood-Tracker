#!/bin/sh

# Generate a random JWT secret if not provided
if [ -z "$JWT_SECRET" ]; then
    echo "Generating random JWT secret..."
    # Use Node.js to generate a secure random string since openssl might not be available
    export JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
    echo "JWT secret generated successfully"
else
    echo "Using provided JWT secret"
fi

# Start the application
exec "$@"
