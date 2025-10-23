CẤU TRÚC DỰ ÁN
src/
├── assets/ # icons/images tĩnh
├── component/ # header, footer
├── features/
│ ├── auth/ # Auth
│ │ ├── components/ # LoginForm, RegisterForm
│ │ ├── hooks/ # useAuth
│ │ └── services/ # authApi.js
│ │ └── authSlice.js/
├── hooks/ # Global (useSocket, useDebounce)
├── lib/ # Config + socket init
│ ├── axios.js
│ ├── constants.js
│ ├── socket.js
│ └── utils.js
├── pages/ # page  
├── store/ # Redux
│ ├── index.js
├── styles/ # globals.css, shadcn.css
├── App.jsx
└── main.jsx
