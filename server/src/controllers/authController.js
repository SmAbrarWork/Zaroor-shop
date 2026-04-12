import { User } from '../models/User.js'
import { generateToken } from '../middleware/auth.js'
import passport from '../config/passport.js'

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' })
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' })
    }
    if (name.length > 100 || email.length > 200) {
      return res.status(400).json({ success: false, message: 'Input too long' })
    }

    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered' })
    }

    const user = await User.create({ name, email, password })
    const token = generateToken(user._id)
    return res.status(201).json({ success: true, data: { user, token } })
  } catch (error) {
    return next(error)
  }
}

export const login = (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err) return next(err)
    if (!user) {
      return res.status(401).json({ success: false, message: info?.message ?? 'Invalid credentials' })
    }
    const token = generateToken(user._id)
    return res.status(200).json({ success: true, data: { user, token } })
  })(req, res, next)
}

export const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email'],
  session: false,
})

export const googleCallback = (req, res, next) => {
  passport.authenticate('google', { session: false }, (err, user) => {
    if (err || !user) {
      return res.redirect(`${process.env.CLIENT_URL ?? 'http://localhost:3000'}/login?error=google_failed`)
    }
    const token = generateToken(user._id)
    return res.redirect(
      `${process.env.CLIENT_URL ?? 'http://localhost:3000'}/login?token=${token}`
    )
  })(req, res, next)
}

export const getMe = async (req, res) => {
  return res.status(200).json({ success: true, data: req.user })
}
