import jwt from 'jsonwebtoken'
import { User } from '../models/User.js'
import { env } from '../config/env.js'

export const protect = async (req, res, next) => {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Not authenticated' })
  }

  try {
    const token = header.split(' ')[1]
    const decoded = jwt.verify(token, env.jwtSecret)
    const user = await User.findById(decoded.id).select('-password')
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' })
    }
    req.user = user
    next()
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid token' })
  }
}

export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, env.jwtSecret, { expiresIn: '7d' })
}
