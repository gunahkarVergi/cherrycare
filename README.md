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

### Cache
- **Redis** - In-memory data store
- **redis** - Redis client for Node.js (`REDIS_URL`, defaults to `redis://localhost:6379`)

### Build and Automation
- **npm workspaces** - Monorepo management (`backend/`, `frontend/`) from a single root `package.json` and a single root `package-lock.json`

## 📋 Prerequisites

| Requirement | Version |
|---|---|
| Node.js | >= 20.19 |
| npm | >= 10 |
| PostgreSQL | 14+ (only needed to run the application, not to build it) |
| Redis | A running instance, reachable at `REDIS_URL` (only needed to run the backend, not to build it) |

> Yarn and pnpm are not supported: the lockfile and the scripts are npm-specific.

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/gunahkarVergi/cherrycare.git
cd cherrycare
```

### 2. Set up the database
Create a PostgreSQL database named `cherrycare` and run the SQL schema from the [Database Schema](#️-database-schema) section.

### 3. Start Redis
The backend connects to Redis at startup and will fail to start if it is unreachable. Use a local install or, for example, Docker:
```bash
docker run -d --name cherrycare-redis -p 6379:6379 redis:7
```

### 4. Configure environment variables
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```
Then edit both files (see [Environment Variables](#-environment-variables)).

### 5. Install dependencies
Run once from the repository root. This installs the dependencies of both workspaces:
```bash
npm install
```

### 6. Start in development mode
Use two terminals, both from the repository root:
```bash
npm run dev:backend    # http://localhost:5000
npm run dev:frontend   # http://localhost:5173
```

## 🏗️ Build, Test and Run

The repository is an npm workspaces monorepo managed from the root `package.json`. All tasks are run from the repository root.

| Task | Command | Notes |
|---|---|---|
| Install dependencies (development) | `npm install` | Resolves both workspaces into one root `node_modules` |
| Install dependencies (reproducible) | `npm ci` | Installs exactly what `package-lock.json` specifies; used for CI and clean builds |
| Run backend in dev mode | `npm run dev:backend` | |
| Run frontend in dev mode | `npm run dev:frontend` | |
| Run backend in production mode | `npm start` | Starts the backend workspace; requires a configured `backend/.env`, a running PostgreSQL and a running Redis |
| Build | `npm run build` | Production build of the frontend with Vite into `frontend/dist`. The backend is plain Node.js and has no compile step |
| Lint | `npm run lint` | Runs ESLint on the frontend workspace. It currently reports pre-existing issues (mostly `react-refresh/only-export-components` and unused variables); fixing them is planned together with the code-quality automation work |
| Test | `npm test` | Runs `test` in every workspace that defines one (`--if-present`). No tests are defined yet; test automation is planned |
| Package | `npm run package` | Builds, then writes one `.tgz` per workspace into `artifacts/` |
| Bump version | `npm run release:patch` | Bumps the patch version in the root and both workspaces (see below) |
| Clean | `npm run clean` | Removes `artifacts/` and `frontend/dist` |

> `clean` and `package` use `rm -rf` and `mkdir -p`; on Windows run them from Git Bash or WSL.

### Reproducible build from a fresh clone

No database is needed to build and package:

```bash
git clone https://github.com/gunahkarVergi/cherrycare.git && cd cherrycare
npm ci && npm run build && npm run package
```

Expected result: `frontend/dist/` (static site) and `artifacts/*.tgz` (backend and frontend packages).

### Running the production build

```bash
npm run build      # produces frontend/dist
npm start          # starts the backend on the port configured in backend/.env
```
`frontend/dist` is a static site and can be served by any static file server or hosting service. Set `VITE_API_URL` in `frontend/.env` **before** building, because Vite embeds it at build time.

### Version management

Versions follow [Semantic Versioning](https://semver.org/) and are kept identical in the root `package.json`, `backend/package.json` and `frontend/package.json`. The lockfile is updated at the same time.

```bash
npm run release:patch                                                  # 1.0.0 -> 1.0.1
npm version minor --workspaces --include-workspace-root --no-git-tag-version   # 1.0.0 -> 1.1.0
npm version major --workspaces --include-workspace-root --no-git-tag-version   # 1.0.0 -> 2.0.0
```
Release notes are recorded manually in [`CHANGELOG.md`](CHANGELOG.md) ([Keep a Changelog](https://keepachangelog.com/) format). `--no-git-tag-version` means no commit or tag is created automatically: commit and tag (`git tag v1.0.1`) yourself after bumping.

### Packaging

`npm run package` runs `npm pack` for the `backend` and `frontend` workspaces and places the archives in `artifacts/` (ignored by Git). To inspect an archive:
```bash
tar -tzf artifacts/<archive-name>.tgz
```

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

Copy the `.env.example` files as described in [Getting Started](#4-configure-environment-variables).

### Backend (`backend/.env`)
```env
DB_USER=your_database_user
DB_HOST=localhost
DB_NAME=cherrycare
DB_PASSWORD=your_database_password
DB_PORT=5432
JWT_SECRET=your_super_secret_jwt_key
REDIS_URL=redis://localhost:6379
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### Frontend (`frontend/.env`)
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

## 🌆 Screenshots

<img width="1920" height="1035" alt="screenshot-notifications" src="https://github.com/user-attachments/assets/2f91cda6-ffc8-4c3a-baef-1676e0d5f11b" />
<img width="395" height="869" alt="screenshot-mobile" src="https://github.com/user-attachments/assets/5f8e4788-945c-4fd3-8faa-be29fd9896ea" />
<img width="1920" height="1035" alt="screenshot-login" src="https://github.com/user-attachments/assets/0c862533-c055-40a5-a09d-2fa944f15fde" />
<img width="1920" height="1035" alt="screenshot-homepage" src="https://github.com/user-attachments/assets/b1b9a162-db8d-4073-8c50-ba5861f2ce28" />
<img width="1920" height="1035" alt="screenshot-admin-dashboard" src="https://github.com/user-attachments/assets/c30c0b75-bcf3-4c61-b075-ca239b67844f" />
<img width="1920" height="1080" alt="screenshot-profile" src="https://github.com/user-attachments/assets/640bc202-64a9-4d2f-9af5-3115b0da18f9" />

⭐ If you found this project helpful, please give it a star!