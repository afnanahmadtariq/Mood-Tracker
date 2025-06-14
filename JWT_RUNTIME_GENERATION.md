# JWT Secret Runtime Generation

## Overview
The application now generates a secure JWT secret at runtime instead of requiring a hardcoded value. This improves security by ensuring each container instance has a unique secret.

## How it works

### 1. Docker Container Startup
- The `entrypoint.sh` script runs before the application starts
- If no `JWT_SECRET` environment variable is provided, it generates a secure 32-byte random hex string using Node.js crypto module
- The generated secret is exported as an environment variable for the application to use

### 2. Application Fallback
- The `auth.ts` file also includes a fallback mechanism that generates a random secret if none is provided
- A warning is logged when using the fallback to alert developers

### 3. Docker Compose Configuration
- The `docker-compose.yml` file no longer includes hardcoded JWT_SECRET values
- The secret is generated fresh for each container startup

## Benefits
- **Security**: Each container instance gets a unique JWT secret
- **Simplicity**: No need to manage or store JWT secrets in configuration
- **Development**: Easier setup for development environments
- **Production**: Can still override with a specific secret via environment variable if needed

## Production Considerations
If you need persistent JWT secrets across container restarts (so existing user sessions remain valid), you can still provide a JWT_SECRET environment variable:

```bash
docker run -e JWT_SECRET=your-persistent-secret your-image
```

Or in docker-compose.yml:
```yaml
environment:
  - JWT_SECRET=your-persistent-secret
```

## Security Note
The generated secrets are cryptographically secure using Node.js's built-in crypto module, which provides the same level of security as manually generated secrets.
