# Hướng dẫn sử dụng Socket.IO cho Chat Realtime

## Cấu hình Socket.IO Client (Frontend)

### 1. Cài đặt Socket.IO Client
```bash
npm install socket.io-client
```

### 2. Khởi tạo kết nối Socket.IO
```javascript
import { io } from 'socket.io-client';

// Khởi tạo kết nối với xác thực JWT
const socket = io('http://localhost:8080', {
  auth: {
    token: 'your-access-token-here'
  }
});

// Hoặc truyền token qua query
const socket = io('http://localhost:8080?token=your-access-token-here');
```

### 3. Xử lý kết nối
```javascript
// Kết nối thành công
socket.on('connect', () => {
  console.log('Connected to server:', socket.id);
});

// Kết nối thất bại
socket.on('connect_error', (error) => {
  console.error('Connection failed:', error.message);
});

// Ngắt kết nối
socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
});
```

## Các sự kiện Socket.IO

### 1. Join/Leave Conversation
```javascript
// Tham gia conversation
socket.emit('join_conversation', conversationId);

// Rời khỏi conversation
socket.emit('leave_conversation', conversationId);
```

### 2. Gửi tin nhắn
```javascript
// Gửi tin nhắn text
socket.emit('send_message', {
  conversationId: 'conversation_id_here',
  content: 'Hello, how are you?',
  type: 'text'
});

// Gửi tin nhắn reply
socket.emit('send_message', {
  conversationId: 'conversation_id_here',
  content: 'This is a reply',
  type: 'text',
  replyTo: 'message_id_to_reply'
});
```

### 3. Lắng nghe tin nhắn mới
```javascript
socket.on('new_message', (data) => {
  console.log('New message:', data.message);
  console.log('Conversation ID:', data.conversationId);
  
  // Cập nhật UI với tin nhắn mới
  addMessageToUI(data.message);
});
```

### 4. Đánh dấu tin nhắn đã đọc
```javascript
// Đánh dấu tin nhắn đã đọc
socket.emit('mark_as_read', {
  messageId: 'message_id_here'
});

// Lắng nghe sự kiện tin nhắn đã đọc
socket.on('message_read', (data) => {
  console.log('Message read:', data.messageId);
  console.log('Read by:', data.readBy);
  console.log('Read at:', data.readAt);
  
  // Cập nhật UI
  updateMessageReadStatus(data.messageId, data.readBy);
});
```

### 5. Typing Indicator
```javascript
// Bắt đầu gõ
socket.emit('typing_start', {
  conversationId: 'conversation_id_here'
});

// Dừng gõ
socket.emit('typing_stop', {
  conversationId: 'conversation_id_here'
});

// Lắng nghe sự kiện typing
socket.on('user_typing', (data) => {
  console.log(`${data.username} is typing...`);
  showTypingIndicator(data.userId, data.username);
});

socket.on('user_stop_typing', (data) => {
  console.log(`${data.username} stopped typing`);
  hideTypingIndicator(data.userId);
});
```

### 6. Trạng thái Online/Offline
```javascript
// Thông báo user online
socket.emit('user_online');

// Lắng nghe thay đổi trạng thái user
socket.on('user_status_changed', (data) => {
  console.log('User status changed:', data);
  updateUserStatus(data.userId, data.status, data.lastSeenAt);
});
```

### 7. Xử lý lỗi
```javascript
socket.on('error', (error) => {
  console.error('Socket error:', error.message);
  // Hiển thị thông báo lỗi cho user
  showErrorMessage(error.message);
});
```

## Ví dụ React Hook sử dụng Socket.IO

```javascript
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export const useSocket = (token) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!token) return;

    const newSocket = io('http://localhost:8080', {
      auth: { token }
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to server');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from server');
    });

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error.message);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [token]);

  return { socket, isConnected };
};

export const useChat = (socket, conversationId) => {
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);

  useEffect(() => {
    if (!socket || !conversationId) return;

    // Join conversation
    socket.emit('join_conversation', conversationId);

    // Lắng nghe tin nhắn mới
    socket.on('new_message', (data) => {
      if (data.conversationId === conversationId) {
        setMessages(prev => [...prev, data.message]);
      }
    });

    // Lắng nghe typing
    socket.on('user_typing', (data) => {
      if (data.conversationId === conversationId) {
        setTypingUsers(prev => [...prev.filter(u => u.userId !== data.userId), data]);
      }
    });

    socket.on('user_stop_typing', (data) => {
      if (data.conversationId === conversationId) {
        setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
      }
    });

    return () => {
      socket.emit('leave_conversation', conversationId);
    };
  }, [socket, conversationId]);

  const sendMessage = (content, type = 'text', replyTo = null) => {
    if (!socket || !conversationId) return;

    socket.emit('send_message', {
      conversationId,
      content,
      type,
      replyTo
    });
  };

  const markAsRead = (messageId) => {
    if (!socket) return;

    socket.emit('mark_as_read', { messageId });
  };

  const startTyping = () => {
    if (!socket || !conversationId) return;

    socket.emit('typing_start', { conversationId });
  };

  const stopTyping = () => {
    if (!socket || !conversationId) return;

    socket.emit('typing_stop', { conversationId });
  };

  return {
    messages,
    typingUsers,
    sendMessage,
    markAsRead,
    startTyping,
    stopTyping
  };
};
```

## API Endpoints bổ sung

### 1. Tạo tin nhắn qua HTTP
```
POST /api/messages
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "conversationId": "conversation_id_here",
  "content": "Hello, how are you?",
  "type": "text",
  "replyTo": "message_id_to_reply" // optional
}
```

### 2. Lấy danh sách tin nhắn
```
GET /api/messages/:conversationId?page=1&limit=50
Authorization: Bearer <access_token>
```

### 3. Đánh dấu tin nhắn đã đọc
```
PUT /api/messages/:messageId/read
Authorization: Bearer <access_token>
```

### 4. Xóa tin nhắn
```
DELETE /api/messages/:messageId
Authorization: Bearer <access_token>
```

### 5. Chỉnh sửa tin nhắn
```
PUT /api/messages/:messageId
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "content": "Updated message content"
}
```

## Lưu ý quan trọng

1. **Xác thực JWT**: Tất cả kết nối socket đều cần JWT token hợp lệ
2. **Rooms**: Mỗi conversation có room riêng để gửi tin nhắn
3. **Error Handling**: Luôn xử lý lỗi kết nối và gửi tin nhắn
4. **Cleanup**: Đóng kết nối socket khi component unmount
5. **Reconnection**: Socket.IO tự động reconnect khi mất kết nối
6. **Rate Limiting**: Có thể cần thêm rate limiting cho typing events

