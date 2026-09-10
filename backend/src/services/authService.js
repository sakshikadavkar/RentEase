import bcrypt from 'bcryptjs';
import { generateToken } from '../config/jwt.js';
import { getPool } from '../config/database.js';

// In-memory fallback user store when PostgreSQL is unconfigured
const inMemoryUsers = new Map([
  [
    'admin@rentease.com',
    {
      id: 1,
      name: 'RentEase Administrator',
      email: 'admin@rentease.com',
      password_hash: bcrypt.hashSync('Admin@12345', 10),
      role: 'admin',
      city: 'Bengaluru',
      created_at: new Date().toISOString(),
    },
  ],
  [
    'customer@rentease.com',
    {
      id: 2,
      name: 'Demo Customer',
      email: 'customer@rentease.com',
      password_hash: bcrypt.hashSync('Customer@12345', 10),
      role: 'customer',
      city: 'Bengaluru',
      created_at: new Date().toISOString(),
    },
  ],
]);

let nextInMemoryId = 3;

const sanitizeUser = (user) => {
  if (!user) return null;
  const safeUser = { ...user };
  delete safeUser.password_hash;
  return safeUser;
};

export const registerUser = async ({ name, email, password, phone = '', city = 'Bengaluru', role = 'customer' }) => {
  const normalizedEmail = email.toLowerCase().trim();
  const pool = getPool();

  const passwordHash = await bcrypt.hash(password, 10);

  if (pool) {
    // 1. PostgreSQL DB flow
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
    if (existing.rows.length > 0) {
      const err = new Error('An account with this email address already exists.');
      err.statusCode = 409;
      err.isOperational = true;
      throw err;
    }

    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, phone, city, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, email, phone, city, role, created_at, updated_at`,
      [name.trim(), normalizedEmail, passwordHash, phone, city, role]
    );

    const user = result.rows[0];
    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    return { user, token };
  } else {
    // 2. In-Memory fallback flow
    if (inMemoryUsers.has(normalizedEmail)) {
      const err = new Error('An account with this email address already exists.');
      err.statusCode = 409;
      err.isOperational = true;
      throw err;
    }

    const newUser = {
      id: nextInMemoryId++,
      name: name.trim(),
      email: normalizedEmail,
      password_hash: passwordHash,
      phone,
      city,
      role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    inMemoryUsers.set(normalizedEmail, newUser);
    const token = generateToken({ id: newUser.id, email: newUser.email, role: newUser.role });
    return { user: sanitizeUser(newUser), token };
  }
};

export const loginUser = async ({ email, password }) => {
  const normalizedEmail = email.toLowerCase().trim();
  const pool = getPool();

  let user;

  if (pool) {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [normalizedEmail]);
    if (result.rows.length === 0) {
      const err = new Error('Invalid email or password.');
      err.statusCode = 401;
      err.isOperational = true;
      throw err;
    }
    user = result.rows[0];
  } else {
    const found = inMemoryUsers.get(normalizedEmail);
    if (!found) {
      const err = new Error('Invalid email or password.');
      err.statusCode = 401;
      err.isOperational = true;
      throw err;
    }
    user = found;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    const err = new Error('Invalid email or password.');
    err.statusCode = 401;
    err.isOperational = true;
    throw err;
  }

  const token = generateToken({ id: user.id, email: user.email, role: user.role });
  return { user: sanitizeUser(user), token };
};

export const getUserById = async (userId) => {
  const pool = getPool();

  if (pool) {
    const result = await pool.query(
      'SELECT id, name, email, phone, city, role, created_at, updated_at FROM users WHERE id = $1',
      [userId]
    );
    if (result.rows.length === 0) {
      return null;
    }
    return result.rows[0];
  } else {
    for (const u of inMemoryUsers.values()) {
      if (u.id === userId) {
        return sanitizeUser(u);
      }
    }
    return null;
  }
};
