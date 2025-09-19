import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

/**
 * Create a JWT token
 * @param {object} payload - data to store in JWT
 * @param {string} secret - secret key
 * @param {string|number} expiresIn - expiration time, e.g. "1h"
 * @returns {string} token
 */
export const createToken = (payload, secret, expiresIn = "1h") => {
  return jwt.sign(
    { ...payload, jti: uuidv4() }, // add unique token id
    secret,
    { expiresIn }
  );
};

/**
 * Verify a JWT token
 * @param {string} token
 * @param {string} secret
 * @returns {object} decoded payload
 */
export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

/**
 * Get TTL (seconds) until token expires
 * @param {string} token
 * @returns {number} seconds
 */
export const getTokenTTL = (token) => {
  const decoded = jwt.decode(token);
  const now = Math.floor(Date.now() / 1000);
  return decoded.exp - now;
};
