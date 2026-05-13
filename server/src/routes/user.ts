import { Router } from 'express'
import multer from 'multer'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'
import fs from 'fs'
import { getProfile, updateProfile } from '../controllers/authController'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { Response } from 'express'

const router = Router()

// Avatar upload config
const avatarDir = path.join(__dirname, '../../uploads/avatars')
if (!fs.existsSync(avatarDir)) {
  fs.mkdirSync(avatarDir, { recursive: true })
}

const avatarStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, avatarDir),
  filename: (_req, _file, cb) => cb(null, `${uuidv4()}.jpg`),
})

const avatarFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (allowed.includes(file.mimetype)) cb(null, true)
  else cb(new Error('仅支持 JPEG、PNG、GIF、WebP 格式'))
}

const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: avatarFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
})

router.post('/avatar', authMiddleware, uploadAvatar.single('avatar'), (req: AuthRequest, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: '请上传头像文件' })
  }
  const url = `/uploads/avatars/${req.file.filename}`
  res.json({ url })
})

router.get('/profile', authMiddleware, getProfile)
router.put('/profile', authMiddleware, updateProfile)

export default router
