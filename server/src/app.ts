import express from 'express'
import cors from 'cors'
import path from 'path'
import multer from 'multer'
import authRoutes from './routes/auth'
import userRoutes from './routes/user'
import chatRoutes from './routes/chat'

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/chat', chatRoutes)

// Multer error handling
app.use((err: any, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'File too large. Maximum size is 5MB.' })
    }
    return res.status(400).json({ error: err.message })
  }
  if (err.message === 'Only JPEG, PNG, GIF, and WebP images are allowed') {
    return res.status(400).json({ error: err.message })
  }
  next(err)
})

export default app
