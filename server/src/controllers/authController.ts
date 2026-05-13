import { Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../utils/db'
import { AuthRequest } from '../middleware/auth'
import { RegisterInput, LoginInput } from '../types'

export async function register(req: AuthRequest, res: Response) {
  try {
    const { email, username, password, avatar, bio }: RegisterInput = req.body

    if (!email || !username || !password || !avatar) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' })
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { email, username, password: hashedPassword, avatar, bio: bio || '' },
    })

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' },
    )

    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, username: user.username, avatar: user.avatar, bio: user.bio },
    })
  } catch (err) {
    console.error('Register error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export async function login(req: AuthRequest, res: Response) {
  try {
    const { email, password }: LoginInput = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' },
    )

    res.json({
      token,
      user: { id: user.id, email: user.email, username: user.username, avatar: user.avatar, bio: user.bio },
    })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export async function getProfile(req: AuthRequest, res: Response) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true, username: true, avatar: true, bio: true, createdAt: true },
    })
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.json(user)
  } catch (err) {
    console.error('Get profile error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export async function updateProfile(req: AuthRequest, res: Response) {
  try {
    const { username, bio } = req.body
    const data: any = {}
    if (username !== undefined) data.username = username
    if (bio !== undefined) data.bio = bio

    const user = await prisma.user.update({
      where: { id: req.userId },
      data,
      select: { id: true, email: true, username: true, avatar: true, bio: true },
    })

    res.json(user)
  } catch (err) {
    console.error('Update profile error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}
