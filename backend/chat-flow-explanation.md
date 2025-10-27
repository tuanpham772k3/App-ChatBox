# Luồng hoạt động Chat Realtime với Socket.IO

## Tổng quan kiến trúc

```
Frontend (React) ←→ Backend (Node.js + Express) ←→ Database (MongoDB)
     ↓                        ↓
Socket.IO Client      Socket.IO Server
     ↓                        ↓
Real-time Events      JWT Authentication
```

## Luồng hoạt động chi tiết

### 1. Kết nối Socket.IO

```
1. User đăng nhập → Nhận Access Token
2. Frontend khởi tạo Socket.IO connection với token
3. Backend xác thực JWT token
4. Nếu hợp lệ → Kết nối thành công
5. User được join vào room cá nhân (user_${userId})
```

### 2. Tạo Conversation 1-1

```
1. User A gọi API POST /api/conversations
2. Gửi participantId (User B)
3. Backend kiểm tra:
   - User A và B có tồn tại không
   - Đã có conversation giữa 2 user chưa
4. Tạo conversation mới hoặc trả về conversation đã có
5. Trả về conversation object cho Frontend
```

### 3. Gửi tin nhắn realtime

```
1. User A mở conversation → Join room conversation_${conversationId}
2. User A gõ tin nhắn → Gửi qua Socket.IO
3. Backend nhận sự kiện "send_message":
   - Xác thực user có quyền gửi tin nhắn
   - Lưu tin nhắn vào database
   - Cập nhật lastMessage trong conversation
4. Backend emit "new_message" đến room conversation_${conversationId}
5. Tất cả user trong conversation nhận tin nhắn realtime
```

### 4. Typing Indicator

```
1. User A bắt đầu gõ → emit "typing_start"
2. Backend nhận sự kiện → emit "user_typing" đến các user khác
3. User B thấy "User A is typing..."
4. User A dừng gõ → emit "typing_stop"
5. Backend emit "user_stop_typing" → User B thấy indicator biến mất
```

### 5. Đánh dấu tin nhắn đã đọc

```
1. User B mở conversation → Tin nhắn hiển thị
2. User B emit "mark_as_read" với messageId
3. Backend cập nhật readBy array trong message
4. Backend emit "message_read" đến room conversation
5. User A thấy tin nhắn đã được đọc (✓✓)
```

### 6. Trạng thái Online/Offline

```
1. User kết nối → emit "user_online"
2. Backend cập nhật status = "active" trong database
3. Backend emit "user_status_changed" đến tất cả conversation của user
4. Các user khác thấy trạng thái online
5. User ngắt kết nối → Backend emit "user_status_changed" với status = "offline"
```

## Các sự kiện Socket.IO chính

### Client → Server (emit)
- `join_conversation` - Tham gia conversation
- `leave_conversation` - Rời khỏi conversation  
- `send_message` - Gửi tin nhắn
- `mark_as_read` - Đánh dấu đã đọc
- `typing_start` - Bắt đầu gõ
- `typing_stop` - Dừng gõ
- `user_online` - Thông báo online

### Server → Client (on)
- `new_message` - Tin nhắn mới
- `message_read` - Tin nhắn đã đọc
- `user_typing` - User đang gõ
- `user_stop_typing` - User dừng gõ
- `user_status_changed` - Thay đổi trạng thái
- `error` - Lỗi xảy ra

## Database Schema

### Conversation
```javascript
{
  type: "private",
  participants: [userId1, userId2],
  lastMessage: {
    sender: userId,
    content: "Last message content",
    createdAt: Date
  },
  isActive: true
}
```

### Message
```javascript
{
  conversation: conversationId,
  sender: userId,
  content: "Message content",
  type: "text",
  status: "sent|delivered|read",
  readBy: [{
    user: userId,
    readAt: Date
  }],
  isDeleted: false
}
```

## Bảo mật

1. **JWT Authentication**: Tất cả socket connection cần token hợp lệ
2. **Room-based messaging**: Tin nhắn chỉ gửi đến user trong conversation
3. **Permission checking**: Kiểm tra quyền truy cập trước khi gửi tin nhắn
4. **Input validation**: Validate tất cả dữ liệu đầu vào
5. **Rate limiting**: Có thể thêm giới hạn tần suất gửi tin nhắn

## Tối ưu hiệu suất

1. **Pagination**: Lấy tin nhắn theo trang để tránh load quá nhiều
2. **Indexing**: Tạo index cho các trường truy vấn thường xuyên
3. **Room management**: Chỉ join room khi cần thiết
4. **Message caching**: Cache tin nhắn gần đây
5. **Connection pooling**: Quản lý kết nối database hiệu quả

## Xử lý lỗi

1. **Connection errors**: Tự động reconnect
2. **Authentication errors**: Redirect về login
3. **Message sending errors**: Hiển thị thông báo lỗi
4. **Network errors**: Retry mechanism
5. **Server errors**: Fallback to HTTP API

