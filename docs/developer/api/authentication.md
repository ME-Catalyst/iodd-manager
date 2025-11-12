# API Authentication

**Note**: Authentication is not currently implemented in IODD Manager 2.0. This document outlines planned authentication features for future versions.

## Current Status

Version 2.0 does not require authentication. All API endpoints are publicly accessible.

**Security Considerations:**

- Use firewall rules to restrict access
- Deploy behind reverse proxy with authentication
- Use VPN for remote access
- Implement network-level security

## Planned Features (v2.1+)

### API Key Authentication

Simple token-based authentication.

**How it works:**

1. Generate API key in web interface
2. Include key in request header:

```bash
curl -H "X-API-Key: your-api-key-here" http://localhost:8000/api/devices
```

**Configuration:**

```bash
# .env
ENABLE_API_KEYS=true
API_KEY_HEADER=X-API-Key
```

### JWT Authentication

JSON Web Token based authentication.

**How it works:**

1. Login with credentials to get JWT:

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password"}'
```

2. Use JWT in subsequent requests:

```bash
curl -H "Authorization: Bearer eyJhbGc..." http://localhost:8000/api/devices
```

**Token expiration**: 1 hour (configurable)

**Refresh tokens**: Available for long-lived sessions

### OAuth 2.0

Third-party authentication support.

**Supported providers:**

- Google
- GitHub
- Microsoft Azure AD
- Custom OAuth providers

**Flow:**

1. Redirect user to OAuth provider
2. User authorizes application
3. Receive access token
4. Use token for API requests

## Role-Based Access Control (RBAC)

Planned role system:

### Roles

| Role | Permissions |
|------|-------------|
| **Viewer** | Read-only access to devices and parameters |
| **User** | Upload IODD files, generate adapters |
| **Admin** | Full access including user management |

### Permissions

```json
{
  "viewer": {
    "devices": ["read"],
    "parameters": ["read"],
    "adapters": ["read"]
  },
  "user": {
    "devices": ["read", "create"],
    "parameters": ["read"],
    "adapters": ["read", "create"]
  },
  "admin": {
    "devices": ["read", "create", "update", "delete"],
    "parameters": ["read", "create", "update", "delete"],
    "adapters": ["read", "create", "delete"],
    "users": ["read", "create", "update", "delete"]
  }
}
```

## User Management API

Planned endpoints:

```bash
# Create user
POST /api/users
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "secure_password",
  "role": "user"
}

# List users (admin only)
GET /api/users

# Update user
PUT /api/users/{user_id}

# Delete user
DELETE /api/users/{user_id}

# Change password
POST /api/users/me/password
```

## API Key Management

Planned endpoints:

```bash
# Generate API key
POST /api/auth/keys
{
  "name": "My Application",
  "expires_in": 2592000  # 30 days in seconds
}

# Response
{
  "key": "iodd_key_abc123...",
  "name": "My Application",
  "expires_at": "2025-02-10T10:00:00Z"
}

# List API keys
GET /api/auth/keys

# Revoke API key
DELETE /api/auth/keys/{key_id}
```

## Implementing Authentication Now

### Option 1: Nginx BasicAuth

Use nginx for HTTP Basic Authentication:

**nginx.conf:**

```nginx
location /api/ {
    auth_basic "IODD Manager";
    auth_basic_user_file /etc/nginx/.htpasswd;

    proxy_pass http://127.0.0.1:8000;
}
```

Create password file:

```bash
sudo htpasswd -c /etc/nginx/.htpasswd admin
```

Usage:

```bash
curl -u admin:password http://yourdomain.com/api/devices
```

### Option 2: API Gateway

Use API gateway like Kong or AWS API Gateway:

- Centralized authentication
- Rate limiting
- Request transformation
- Monitoring

### Option 3: VPN Access

Restrict API access to VPN:

- Deploy IODD Manager on private network
- Require VPN connection
- Network-level security

## Security Best Practices

Until authentication is implemented:

1. **Network Security**:
   - Firewall rules
   - VPN requirements
   - Internal network only

2. **Reverse Proxy**:
   - nginx with BasicAuth
   - Client certificates
   - IP whitelisting

3. **HTTPS Only**:
   - SSL/TLS certificates
   - Redirect HTTP to HTTPS
   - HSTS headers

4. **Monitoring**:
   - Log all API requests
   - Monitor for suspicious activity
   - Set up alerts

## Migration Plan

When authentication is added:

1. **Backward Compatibility**: Anonymous access available with flag
2. **Gradual Migration**:
   - v2.1: Optional authentication
   - v2.2: Authentication recommended
   - v3.0: Authentication required
3. **Migration Tools**: Scripts to create initial users

## Configuration

Future configuration options:

```bash
# .env
# Authentication
ENABLE_AUTHENTICATION=true
AUTH_METHOD=jwt  # jwt, api_key, oauth

# JWT settings
JWT_SECRET_KEY=your-secret-key-here
JWT_ALGORITHM=HS256
JWT_EXPIRATION=3600  # 1 hour

# API Key settings
API_KEY_EXPIRATION=2592000  # 30 days

# OAuth settings
OAUTH_PROVIDER=google
OAUTH_CLIENT_ID=your-client-id
OAUTH_CLIENT_SECRET=your-client-secret
```

## Contributing

Interested in implementing authentication? See:

- **[Contributing Guide](../developer-guide/contributing.md)**
- **GitHub Issue**: [#123 - Add authentication support](https://github.com/ME-Catalyst/iodd-manager/issues/)

## Next Steps

- **[API Overview](overview.md)** - API introduction
- **[Endpoints Reference](endpoints.md)** - Available endpoints
- **[Error Handling](errors.md)** - Error codes
- **[Deployment Guide](../deployment/production.md)** - Secure deployment
