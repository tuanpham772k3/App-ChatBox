CẤU TRÚC DỰ ÁN REACT MODULE BY FEATURE
src/
├── assets/ # icons/images tĩnh
├── component/
│ ├─ NavSidebar.tsx
│ └─ NavItem.tsx
├── features/
│ ├── auth/ # Auth
│ │ ├── components/ # LoginForm, RegisterForm
│ │ ├── hooks/ # useAuth
│ │ └── services/ # authApi.js
│ │ └── authSlice.js/
│ ├── chat/
│ │ ├── components/
| | | ├─ ChatHeader.tsx
| | | ├─ MessageList.tsx
| | | ├─ MessageItem.tsx
| | | └─ ChatInput.tsx
│ │ ├── hooks/
│ │ └── services/
│ │ └── chatSlice.js/
│ ├── conversation/
│ │ ├── components/
| │ | ├─ ConversationList.tsx
| │ | ├─ ConversationItem.tsx
| │ | └─ SearchBar.tsx
│ │ ├── hooks/
│ │ └── services/
│ │ └── conversationSlice.js/
├── hooks/ # Global (useSocket, useDebounce)
├── lib/ # Config + socket init
│ ├── axios.js
│ ├── constants.js
│ ├── socket.js
│ └── utils.js
├── pages/ # page
│ ├─ LoginPage.jsx
│ ├─ ChatPage.jsx
├── store/ # Redux toolkit
│ ├── index.js
├── styles/ # globals.css
├── App.jsx
└── main.jsx
