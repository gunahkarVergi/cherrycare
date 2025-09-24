# 🍒 CherryCare - Healthcare Financing Platform

A modern web application for managing healthcare financing applications with real-time notifications.

## ✨ Features

- 🔐 **User Authentication** - Secure signup/login with JWT
- 📊 **Dashboard** - Manage financing applications
- 🔔 **Real-time Notifications** - WebSocket-powered updates
- 💳 **Application Management** - Submit and track financing requests
- 📱 **Responsive Design** - Works on all devices
- 🎨 **Modern UI** - Built with Shadcn/ui and TailwindCSS

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **TailwindCSS** - Utility-first CSS framework
- **Shadcn/ui** - Component library
- **React Router** - Client-side routing
- **Socket.IO Client** - Real-time communication

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **Socket.IO** - Real-time communication
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin requests

### Database
- **PostgreSQL** - Primary database
- **pg** - PostgreSQL client for Node.js

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### 1. Clone the repository
```bash
git clone https://github.com/gunahkarVergi/cherrycare.git
cd cherrycare
```

### 2. Setup Database
Create a PostgreSQL database named `cherrycare` and run the SQL schema provided below.

### 3. Setup Backend
```bash
cd backend
npm install
```

Create `.env` file with the environment variables listed below.

Start backend:
```bash
npm run dev
```

### 4. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

### 5. Access the application
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(20) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Applications Table
```sql
CREATE TABLE financing_applications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  service_name VARCHAR(255) NOT NULL,
  reason TEXT NOT NULL,
  payment_plan VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Notifications Table
```sql
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'general',
  is_read BOOLEAN DEFAULT FALSE,
  application_id INTEGER REFERENCES financing_applications(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔧 Environment Variables

### Backend (.env)
```env
DB_USER=your_database_user
DB_HOST=localhost
DB_NAME=cherrycare
DB_PASSWORD=your_database_password
DB_PORT=5432
JWT_SECRET=your_super_secret_jwt_key
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
```

## 📝 API Endpoints

### Test
- `GET /api/ping` - Test if application is running
- `GET /db-test` - Test if database connection is working

### Admin
- `GET /api/admin/admin-test` - Admin authentication test
- `GET /api/admin/all-users` - Get all users' information
- `PATCH /api/admin/change-role/:id` - Change user role
- `GET /api/admin/applications` - Get all applications' information
- `PATCH /api/admin/applications/:id` - Update single application
- `POST /api/admin/applications/notify-admins` - Notify all admins when application is submitted

### User
- `POST /api/users/signup` - User registration
- `POST /api/users/login` - User login
- `POST /api/users/logout` - User logout
- `GET /api/users/me` - Get user profile
- `PATCH /api/users/me` - Edit user profile
- `DELETE /api/users/me` - Delete user profile

### Applications
- `POST /api/financing-applications/submit` - Submit new application
- `GET /api/financing-applications/my` - Get current user applications
- `GET /api/financing-applications/applications` - Get all users' applications
- `PATCH /api/financing-applications/application/:id` - Update application status (approve/reject)

### Notifications
- `GET /api/notifications` - Get user notifications
- `PATCH /api/notifications/:id/read` - Mark notification as read
- `PATCH /api/notifications/mark-all-read` - Mark all notifications as read
- `DELETE /api/notifications/:id` - Delete notification

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Mustafa Oguz Lulecioglu**
- GitHub: [@gunahkarVergi](https://github.com/gunahkarVergi)
- LinkedIn: [sinnytax](https://linkedin.com/in/sinnytax)
- Email: oguzluleci@gmail.com

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - UI library
- [TailwindCSS](https://tailwindcss.com/) - CSS framework
- [Shadcn/ui](https://ui.shadcn.com/) - Component library
- [Socket.IO](https://socket.io/) - Real-time communication

---

⭐ If you found this project helpful, please give it a star!