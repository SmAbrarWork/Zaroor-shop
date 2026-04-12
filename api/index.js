import app from '../server/src/app.js'
import { connectDb } from '../server/src/config/db.js'

export default async function handler(req, res) {
  await connectDb()
  return app(req, res)
}
