import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import pool from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import financingRoutes from "./routes/financingRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import { authenticateSocket } from "./middlewares/socketAuthMiddleware.js";

// Load environment variables - KEEP THIS!
dotenv.config();

const app = express();
const server = http.createServer(app);

// Socket.io setup with CORS
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",  // React default
      "http://localhost:5173"  // Vite frontend default
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://localhost:5173"
  ],
  credentials: true
}));
app.use(express.json());

// Apply authentication middleware
io.use(authenticateSocket);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`User ${socket.userId} connected`);
  
  // Join user to their own room for targeted notifications
  socket.join(`user_${socket.userId}`);
  
  // Join admin users to admin room
  if (socket.userRole === 'admin') {
    socket.join('admin_room');
  }

  socket.on('disconnect', () => {
    console.log(`User ${socket.userId} disconnected`);
  });
});

// Helper function to emit notifications
const emitNotification = (userId, notification) => {
  io.to(`user_${userId}`).emit('new_notification', notification);
};

// Helper function to emit to all admins
const emitToAdmins = (notification) => {
  io.to('admin_room').emit('new_notification', notification);
};

// Make io available to routes
app.locals.io = io;
app.locals.emitNotification = emitNotification;
app.locals.emitToAdmins = emitToAdmins;

// Routes
// Test route
app.get("/ping", (req, res) => {
  res.json({ message: "pong 🏓" });
});

// Test DB connection
app.get("/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    const nowUTC = new Date(result.rows[0].now);
    const localTime = nowUTC.toLocaleString("en-GB", {
      timeZone: "Europe/Paris",
    });
    res.json({ time: localTime });
  } catch (err) {
    console.error("❌ DB connection error:", err.message);
    res.status(500).json({ error: "Database connection failed" });
  }
});
app.use('/api/users', userRoutes);
app.use('/api/financing-applications', financingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});