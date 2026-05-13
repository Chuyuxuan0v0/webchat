import { Router } from 'express'
import multer from 'multer'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'
import fs from 'fs'
import prisma from '../utils/db'
import { authMiddleware, AuthRequest } from '../middleware/auth'

const router = Router()

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// Multer configuration with security
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    cb(null, `${uuidv4()}${ext}`)
  },
})

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Only JPEG, PNG, GIF, and WebP images are allowed'))
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
})

// Image upload
router.post('/upload', authMiddleware, upload.single('image'), (req: AuthRequest, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided' })
  }
  const url = `/uploads/${req.file.filename}`
  res.json({ url })
})

// Chat history
router.get('/history', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const targetId = req.query.targetId ? parseInt(req.query.targetId as string) : null
    const cursor = req.query.cursor ? parseInt(req.query.cursor as string) : undefined
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100)

    const where: any = {}
    if (targetId === null) {
      where.targetId = null // Group chat
    } else {
      // Private chat: messages between current user and target
      where.OR = [
        { userId: req.userId, targetId },
        { userId: targetId, targetId: req.userId },
      ]
    }

    if (cursor) {
      where.id = { lt: cursor }
    }

    const messages = await prisma.message.findMany({
      where,
      include: {
        user: { select: { id: true, username: true, avatar: true } },
      },
      orderBy: { id: 'desc' },
      take: limit,
    })

    const formatted = messages.reverse().map(msg => ({
      id: msg.id,
      content: msg.content,
      type: msg.type,
      format: msg.format,
      userId: msg.user.id,
      username: msg.user.username,
      avatar: msg.user.avatar,
      targetId: msg.targetId,
      createdAt: msg.createdAt.toISOString(),
    }))

    res.json(formatted)
  } catch (err) {
    console.error('History error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Unread counts
router.get('/unread', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const unread = await prisma.message.groupBy({
      by: ['userId'],
      where: {
        targetId: req.userId,
        isRead: false,
      },
      _count: { id: true },
    })

    const result = unread.map(item => ({
      targetId: item.userId,
      count: item._count.id,
    }))

    res.json(result)
  } catch (err) {
    console.error('Unread error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Mark as read
router.put('/read', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const targetId = parseInt(req.query.targetId as string)
    if (isNaN(targetId)) {
      return res.status(400).json({ error: 'targetId is required' })
    }

    await prisma.message.updateMany({
      where: {
        userId: targetId,
        targetId: req.userId,
        isRead: false,
      },
      data: { isRead: true },
    })

    res.json({ success: true })
  } catch (err) {
    console.error('Mark read error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
