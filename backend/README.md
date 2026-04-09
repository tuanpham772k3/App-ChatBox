# Backend API (Node.js + Express + MongoDB)

## 1) Project Overview

This project is a backend API for a chat-style application.

It handles:
- User authentication (register, login, logout)
- User profile management
- Conversations and messages
- File upload

In simple terms: the frontend sends requests, and this backend validates data, talks to MongoDB, and returns JSON responses.

## 2) Tech Stack

- `Node.js`: JavaScript runtime for running backend code
- `Express`: Framework for creating API routes
- `MongoDB`: NoSQL database to store app data
- `Mongoose`: ODM to define models and query MongoDB
- `JWT (jsonwebtoken)`: Creates access tokens for protected routes
- `cookie-parser`: Reads cookies (used for refresh token flow)
- `dotenv`: Loads environment variables from `.env`
- `multer` + `cloudinary`: Handles file upload and cloud storage
- `socket.io`: Real-time communication support

## 3) Folder Structure

```bash
backend/
├─ src/
│  ├─ app.js
│  ├─ server.js
│  ├─ config/
│  │  ├─ db.js
│  │  ├─ cloudinary.js
│  │  └─ multer.js
│  ├─ middlewares/
│  │  ├─ authMiddleware.js
│  │  ├─ errorMiddleware.js
│  │  └─ rateLimit.js
│  ├─ modules/
│  │  ├─ auth/
│  │  ├─ users/
│  │  ├─ conversations/
│  │  ├─ messages/
│  │  └─ upload/
│  ├─ sockets/
│  ├─ socket.js
│  └─ utils/
├─ package.json
└─ .env
```

Main folders:
- `src/config`: Database, upload, and external service config
- `src/middlewares`: Auth check, error handling, rate limit
- `src/modules`: Feature-based modules (auth, users, messages, etc.)
- `src/sockets`: Socket handlers for real-time events

## 4) Getting Started

### Step 1: Clone the repository

```bash
git clone <your-repo-url>
cd chatbox-app/backend
```

### Step 2: Install dependencies

```bash
npm install
```

### Step 3: Create `.env`

Create a `.env` file in `backend/` and add:

```env
PORT=8080
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/chatbox_db
ACCESS_TOKEN_SECRET=your_super_secret_key
CLIENT_ORIGIN=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Step 4: Run the server

Development mode (auto restart):

```bash
npm run dev
```

Production mode:

```bash
npm start
```

Health check:

```bash
GET http://localhost:8080/health
```

## 5) Environment Variables

Required variables:

- `PORT`: Port for backend server (example: `8080`)
- `NODE_ENV`: App environment (`development` or `production`)
- `MONGO_URI`: MongoDB connection string
- `ACCESS_TOKEN_SECRET`: Secret used to sign JWT access tokens
- `CLIENT_ORIGIN`: Frontend URL allowed by CORS
- `CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name (for file upload)
- `CLOUDINARY_API_KEY`: Cloudinary API key
- `CLOUDINARY_API_SECRET`: Cloudinary API secret

## 6) API Overview

Base URL:

```text
http://localhost:8080/api
```

Main route groups:

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /user/profile` (protected)
- `PUT /user/profile` (protected)
- `GET /user/search` (protected)
- `GET /conversations` (protected)
- `GET /messages/:conversationId` (protected)
- `POST /upload` (protected)

### Example: Register

Request:

```http
POST /api/auth/register
Content-Type: application/json
```

```json
{
  "username": "john",
  "email": "john@example.com",
  "password": "123456"
}
```

Response:

```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user": {
      "id": "661111111111111111111111",
      "username": "john",
      "email": "john@example.com"
    }
  }
}
```

### Example: Protected request

```http
GET /api/user/profile
Authorization: Bearer <access_token>
```

## 7) Authentication Flow (JWT)

Simple flow:

1. User logs in with email + password
2. Server returns an `accessToken` in JSON
3. Server also sets a `refreshToken` in an HTTP-only cookie
4. Frontend sends `Authorization: Bearer <accessToken>` for protected routes
5. If access token expires, frontend calls `/api/auth/refresh` to get a new access token
6. User logs out by calling `/api/auth/logout`

## 8) Error Handling

This project has centralized error handling:

- If route does not exist -> returns `404` with message `"Route not found"`
- If server error happens -> returns `500` (or custom status code) with an error message
- Auth middleware returns `401/403` when token is missing or invalid

Example error response:

```json
{
  "message": "Route not found"
}
```

## 9) Scripts

From `package.json`:

- `npm run dev`: Start server with `nodemon` (best for development)
- `npm start`: Start server with `node` (production-like)
- `npm test`: Run tests with Jest
- `npm run lint`: Run ESLint

## 10) Notes

- Always keep secrets in `.env`, never hardcode them
- MongoDB must be running before starting the backend
- Protected endpoints need `Authorization: Bearer <token>`
- For cookie-based refresh token, frontend should send credentials in requests
- Upload endpoints require valid Cloudinary credentials

