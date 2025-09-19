import dotenv from "dotenv";
import redisClient from "../config/redisClient.js";
import { verifyToken } from "../utils/jwt.js";
import { REDIS_BLACKLIST_PREFIX } from "../config/constants.js";

dotenv.config();

export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyToken(token); // <- use helper

    // Check if token jti is blacklisted
    const isBlacklisted = await redisClient.get(`${REDIS_BLACKLIST_PREFIX}${decoded.jti}`);
    if (isBlacklisted) {
      return res.status(401).json({ error: "Unauthorized: Token blacklisted" });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Unauthorized: Invalid or expired token" });
  }
};

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    if (allowedRoles.length === 0) return next(); // any logged-in user

    if (allowedRoles.includes(req.user.role)) return next(); // allowed role

    return res.status(403).json({ error: "Forbidden: Insufficient permissions" });
  };
};


/* // Socket.io authentication middleware
export const authenticateSocket = (socket, next) => {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    return next(new Error('Authentication error'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    socket.userRole = decoded.role;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
}; */