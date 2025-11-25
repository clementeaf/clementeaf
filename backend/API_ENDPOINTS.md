# API Endpoints Reference

**Base URL:** `https://api.banados.local/dev` (dev) or `https://api.banados.local/prod` (prod)

---

## 🟢 GET Endpoints (Read Operations)

### Health & Debug
- `GET /hello` → Returns greeting message

### Authentication & Users
- `GET /auth/me` → Get current user profile
- `GET /users` → List all users
- `GET /users/{id}` → Get user by ID

### Clients
- `GET /clients` → List all clients
- `GET /clients/{id}` → Get client by ID

### Tickets (Support/Issues)
- `GET /tickets` → List all tickets
- `GET /tickets/{id}` → Get ticket by ID
- `GET /tickets/reporter/{userId}` → Get tickets created by user
- `GET /tickets/assignee/{userId}` → Get tickets assigned to user

### Chat/Conversations
- `GET /chat/conversations/user/{userId}` → Get user's conversations
- `GET /chat/conversations/{conversationId}` → Get conversation details
- `GET /chat/conversations/{conversationId}/messages` → Get conversation messages

### Analytics & Data
- `GET /analytics/ctas-por-cobrar` → Get accounts receivable
- `GET /analytics/deudas-activas` → Get active debts
- `GET /analytics/estadisticas` → Get statistics
- `GET /analytics/resumen/clientes` → Get client summary
- `GET /analytics/resumen/vendedores` → Get sales rep summary

### CheckAuditor Integration
- `GET /checkauditor/company-data` → Get company data from CheckAuditor
- `GET /checkauditor/notifications` → Get CheckAuditor notifications

---

## 🔵 POST Endpoints (Create Operations)

### Authentication
- `POST /auth/register` → Register new user
  ```json
  {
    "email": "user@example.com",
    "password": "Password123!",
    "name": "John Doe"
  }
  ```

- `POST /auth/login` → Login user
  ```json
  {
    "email": "user@example.com",
    "password": "Password123!"
  }
  ```

- `POST /auth/logout` → Logout user (requires token)

- `POST /auth/refresh` → Refresh auth token
  ```json
  {
    "refreshToken": "token_value"
  }
  ```

### Clients
- `POST /clients` → Create new client
  ```json
  {
    "name": "Client Name",
    "email": "client@example.com",
    "phone": "+56912345678"
  }
  ```

### Tickets
- `POST /tickets` → Create new ticket
  ```json
  {
    "title": "Issue title",
    "description": "Issue description",
    "priority": "high"
  }
  ```

- `POST /tickets/presigned-url` → Get presigned URL for S3 upload
  ```json
  {
    "fileName": "document.pdf",
    "contentType": "application/pdf"
  }
  ```

### Chat
- `POST /chat/conversations` → Create new conversation
  ```json
  {
    "participantIds": ["user1", "user2"],
    "title": "Conversation title"
  }
  ```

- `POST /chat/messages` → Send message
  ```json
  {
    "conversationId": "conv_id",
    "content": "Message text"
  }
  ```

- `POST /chat/typing/start` → Notify typing started
  ```json
  {
    "conversationId": "conv_id"
  }
  ```

- `POST /chat/typing/stop` → Notify typing stopped
  ```json
  {
    "conversationId": "conv_id"
  }
  ```

### Email
- `POST /email/send` → Send email
  ```json
  {
    "to": "recipient@example.com",
    "subject": "Subject",
    "body": "Email body",
    "html": "<p>HTML body</p>"
  }
  ```

### Analytics
- `POST /analytics/sync` → Sync data from S3
  - Requires admin role
  - Timeout: 300 seconds
  - Memory: 1024 MB

### CheckAuditor
- `POST /checkauditor/sessions` → Authenticate CheckAuditor session
  ```json
  {
    "username": "user",
    "password": "pass"
  }
  ```

### System
- `POST /migrations/run` → Run database migrations
  - Requires admin role
  - Timeout: 60 seconds

---

## 🟡 PUT Endpoints (Update Operations)

### Clients
- `PUT /clients/{id}` → Update client
  ```json
  {
    "name": "Updated name",
    "email": "newemail@example.com",
    "phone": "+56987654321"
  }
  ```

### Tickets
- `PUT /tickets/{id}` → Update ticket
  ```json
  {
    "status": "in-progress",
    "priority": "medium",
    "description": "Updated description"
  }
  ```

### Chat
- `PUT /chat/messages/{messageId}/read` → Mark message as read

- `PUT /chat/conversations/{conversationId}/messages/read` → Mark all messages as read

---

## 🔴 DELETE Endpoints (Remove Operations)

### Clients
- `DELETE /clients/{id}` → Delete client

### Tickets
- `DELETE /tickets/{id}` → Delete ticket

---

## 🟣 WebSocket Endpoints (Real-time)

### Chat WebSocket
- `wss://api.banados.local/dev/chat` → WebSocket connection for real-time chat
  - Connection: `POST /chat/websocket/connect`
  - Disconnection: `DELETE /chat/websocket/disconnect`
  - Send message: `POST /chat/websocket/send-message`

---

## 📋 Authentication

### Headers Required for Protected Endpoints
```bash
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Token Response Format
```json
{
  "token": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

---

## 📊 Response Format

### Success Response
```json
{
  "statusCode": 200,
  "body": {
    "success": true,
    "data": { ... },
    "message": "Operation successful"
  }
}
```

### Error Response
```json
{
  "statusCode": 400,
  "body": {
    "success": false,
    "error": "Error message",
    "message": "Detailed error message"
  }
}
```

---

## 🔒 Role-Based Access Control

### Public Endpoints (No Auth Required)
- `GET /hello`
- `POST /auth/register`
- `POST /auth/login`

### Protected Endpoints (Token Required)
- `/auth/me`
- `/users/**`
- `/clients/**`
- `/tickets/**`
- `/chat/**`
- `/email/**`

### Admin-Only Endpoints
- `POST /analytics/sync`
- `POST /migrations/run`

---

## ⚡ Rate Limiting

Currently no rate limiting implemented. Recommended for production:
- 1000 requests/hour per user
- 100 requests/minute per endpoint

---

## 📈 Total Endpoints

- **GET:** 20 endpoints
- **POST:** 15 endpoints
- **PUT:** 4 endpoints
- **DELETE:** 2 endpoints
- **WebSocket:** 3 connection types
- **Total:** 44 endpoints

---

## 🧪 Testing Endpoints

### Quick Test
```bash
# Health check
curl https://api.banados.local/dev/hello

# Register
curl -X POST https://api.banados.local/dev/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "password": "Test123!",
    "name": "Test User"
  }'

# Login
curl -X POST https://api.banados.local/dev/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "password": "Test123!"
  }'

# Get current user (replace TOKEN with actual token)
curl https://api.banados.local/dev/auth/me \
  -H "Authorization: Bearer TOKEN"
```

---

## 🔧 Troubleshooting

### 401 Unauthorized
- Token expired → Use refresh endpoint
- Invalid token → Re-login
- Missing token → Add Authorization header

### 403 Forbidden
- Insufficient permissions → Check user role
- Admin endpoint → Only admins can access

### 404 Not Found
- Endpoint doesn't exist → Check path and method
- Resource not found → Verify resource ID

### 500 Internal Server Error
- Check CloudWatch logs: `aws logs tail /aws/lambda/backend-dev --follow`
- Check Lambda function error: `aws lambda get-function --function-name backend-dev-login`

---

## 📚 Complete Handler Compilation Status

✅ All 44 handlers compiled successfully
✅ All endpoints configured in serverless.yml
✅ CORS enabled on all HTTP endpoints
✅ TypeScript strict mode enabled
✅ Environment variables validated

Ready for deployment!
