# Test Conversation API

## API Endpoints đã tạo

### 1. Tạo conversation 1-1
**POST** `/api/conversations`

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Body:**
```json
{
  "participantId": "64f8a1b2c3d4e5f6a7b8c9d0"
}
```

**Response thành công:**
```json
{
  "success": true,
  "message": "Conversation created successfully",
  "idCode": 0,
  "data": {
    "conversation": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "type": "private",
      "participants": [
        {
          "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
          "username": "user1",
          "email": "user1@example.com",
          "avatarUrl": {
            "url": "https://example.com/avatar1.jpg"
          }
        },
        {
          "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
          "username": "user2",
          "email": "user2@example.com",
          "avatarUrl": {
            "url": "https://example.com/avatar2.jpg"
          }
        }
      ],
      "name": null,
      "avatar": {
        "url": null,
        "public_id": null
      },
      "lastMessage": {
        "sender": null,
        "content": null,
        "createdAt": null
      },
      "isActive": true,
      "admin": [],
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    },
    "isNew": true
  }
}
```

### 2. Lấy danh sách conversation
**GET** `/api/conversations?page=1&limit=20`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response thành công:**
```json
{
  "success": true,
  "message": "Conversations retrieved successfully",
  "idCode": 0,
  "data": {
    "conversations": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 100,
      "itemsPerPage": 20
    }
  }
}
```

### 3. Lấy thông tin chi tiết conversation
**GET** `/api/conversations/:conversationId`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response thành công:**
```json
{
  "success": true,
  "message": "Conversation retrieved successfully",
  "idCode": 0,
  "data": {
    "conversation": {...}
  }
}
```

### 4. Xóa conversation
**DELETE** `/api/conversations/:conversationId`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response thành công:**
```json
{
  "success": true,
  "message": "Conversation deleted successfully",
  "idCode": 0,
  "data": {
    "success": true,
    "message": "Conversation deleted successfully"
  }
}
```

## Cách test với Postman/Thunder Client

1. **Đăng nhập để lấy access token:**
   ```
   POST /api/auth/login
   Body: { "email": "user@example.com", "password": "password123" }
   ```

2. **Copy access token từ response**

3. **Test tạo conversation:**
   ```
   POST /api/conversations
   Headers: Authorization: Bearer <access_token>
   Body: { "participantId": "64f8a1b2c3d4e5f6a7b8c9d0" }
   ```

4. **Test các endpoint khác tương tự**

## Error Codes

- `idCode: 1` - Validation error (thiếu tham số, format sai)
- `idCode: 2` - Not found (user không tồn tại, conversation không tồn tại)
- `idCode: 3` - Access denied (không có quyền truy cập)
- `idCode: 4` - Business logic error (tạo conversation với chính mình)
- `idCode: 5` - Internal server error

