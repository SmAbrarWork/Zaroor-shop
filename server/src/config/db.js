import mongoose from 'mongoose'
import { env } from './environment.js'

let connectPromise = null

export const connectDb = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection
  }
  if (!connectPromise) {
    connectPromise = mongoose.connect(env.mongoUri).catch((err) => {
      connectPromise = null
      throw err
    })
  }
  await connectPromise
  return mongoose.connection
}
