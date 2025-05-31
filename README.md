# Blog Management System - Backend API

A comprehensive MERN stack blog management system with authentication, role-based access control, and advanced features.

## 🚀 Features

### Authentication & Authorization

- JWT-based authentication with refresh tokens
- Role-based access control (Admin/Author)
- Password hashing with bcrypt
- Secure token management

### Blog Management

- CRUD operations for blog posts
- Draft and published post status
- Tag-based categorization
- Search functionality
- Pagination support
- View tracking

### Comment System

- Add comments to published posts
- Update/delete own comments
- Admin can manage all comments

### Advanced Features

- Input validation with Joi
- Error handling middleware
- MongoDB aggregation for statistics
- Text search indexing
- Optimized database queries

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd blog-backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   ```bash
   cp config.env .env
   ```

   Update the `.env` file with your MongoDB URL:

   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   JWT_REFRESH_SECRET=your_refresh_secret
   PORT=5000
   ```

4. **Start the server**

   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## 📚 API Documentation

### Base URL

```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User

```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123",
  "role": "author" // optional, defaults to "author"
}
```

#### Login User

```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Password123"
}
```

#### Refresh Token

```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "your_refresh_token"
}
```

#### Get Profile

```http
GET /auth/profile
Authorization: Bearer your_access_token
```

#### Logout

```http
POST /auth/logout
Authorization: Bearer your_access_token
```

### Post Endpoints

#### Get Published Posts (Public)

```http
GET /posts?page=1&limit=10&search=react&tags=javascript,react&sortBy=createdAt&sortOrder=desc
```

#### Get My Posts (Author's posts)

```http
GET /posts/my?page=1&limit=10&status=draft
Authorization: Bearer your_access_token
```

#### Get Single Post

```http
GET /posts/:id
Authorization: Bearer your_access_token (optional)
```

#### Create Post

```http
POST /posts
Authorization: Bearer your_access_token
Content-Type: application/json

{
  "title": "My Blog Post",
  "content": "This is the content of my blog post...",
  "status": "draft", // or "published"
  "tags": ["javascript", "react", "nodejs"]
}
```

#### Update Post

```http
PUT /posts/:id
Authorization: Bearer your_access_token
Content-Type: application/json

{
  "title": "Updated Title",
  "content": "Updated content...",
  "status": "published",
  "tags": ["updated", "tags"]
}
```

#### Update Post Status

```http
PATCH /posts/:id/status
Authorization: Bearer your_access_token
Content-Type: application/json

{
  "status": "published"
}
```

#### Delete Post

```http
DELETE /posts/:id
Authorization: Bearer your_access_token
```

#### Get Post Statistics (Admin only)

```http
GET /posts/stats
Authorization: Bearer your_access_token
```

### Comment Endpoints

#### Get Post Comments

```http
GET /posts/:id/comments?page=1&limit=10
```

#### Add Comment

```http
POST /posts/:id/comments
Authorization: Bearer your_access_token
Content-Type: application/json

{
  "content": "This is a great post!"
}
```

#### Update Comment

```http
PUT /posts/comments/:commentId
Authorization: Bearer your_access_token
Content-Type: application/json

{
  "content": "Updated comment content"
}
```

#### Delete Comment

```http
DELETE /posts/comments/:commentId
Authorization: Bearer your_access_token
```

## 🔐 Authentication

All protected routes require a Bearer token in the Authorization header:

```
Authorization: Bearer your_access_token
```

## 👥 User Roles

### Author

- Create, read, update, delete own posts
- Add comments to published posts
- Update/delete own comments

### Admin

- All author permissions
- Manage all posts (any author)
- Delete any comments
- Access post statistics

## 📊 Response Format

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "pagination": { ... } // for paginated responses
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

## 🗄️ Database Models

### User

- name, email, password, role, timestamps
- Indexes: email (unique)

### Post

- title, content, author, status, tags, slug, readTime, views, timestamps
- Indexes: text search, status+createdAt, author+status

### Comment

- content, author, post, isEdited, editedAt, timestamps
- Indexes: post+createdAt, author

## 🚦 Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request / Validation Error
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## 🧪 Testing

Test the API using tools like:

- Postman
- Thunder Client (VS Code)
- curl commands

### Health Check

```http
GET /api/health
```

## 🔧 Development

### Project Structure

```
blog-backend/
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
├── models/         # Database models
├── routes/         # API routes
├── utils/          # Utility functions
├── config.env      # Environment variables
├── server.js       # Main server file
└── package.json    # Dependencies
```

### Scripts

```bash
npm run dev     # Start development server with nodemon
npm start       # Start production server
```

## 📝 Notes

- MongoDB connection required
- JWT tokens expire in 1 hour (configurable)
- Refresh tokens expire in 7 days (configurable)
- Text search requires MongoDB text indexes
- File uploads not implemented (can be added with multer)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request
