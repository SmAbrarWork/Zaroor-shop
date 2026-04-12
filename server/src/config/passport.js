import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { Strategy as LocalStrategy } from 'passport-local'
import { User } from '../models/User.js'
import { env } from './env.js'

passport.use(
  new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
      const user = await User.findOne({ email })
      if (!user || !user.password) {
        return done(null, false, { message: 'Invalid email or password' })
      }
      const isMatch = await user.comparePassword(password)
      if (!isMatch) {
        return done(null, false, { message: 'Invalid email or password' })
      }
      return done(null, user)
    } catch (err) {
      return done(err)
    }
  })
)

if (env.googleClientId && env.googleClientSecret) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.googleClientId,
        clientSecret: env.googleClientSecret,
        callbackURL: env.googleCallbackUrl,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ googleId: profile.id })
          if (user) return done(null, user)

          user = await User.findOne({ email: profile.emails?.[0]?.value })
          if (user) {
            user.googleId = profile.id
            user.avatar = user.avatar || profile.photos?.[0]?.value || ''
            await user.save()
            return done(null, user)
          }

          user = await User.create({
            name: profile.displayName,
            email: profile.emails[0].value,
            googleId: profile.id,
            avatar: profile.photos?.[0]?.value || '',
          })
          return done(null, user)
        } catch (err) {
          return done(err)
        }
      }
    )
  )
}

export default passport
