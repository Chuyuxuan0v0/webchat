import jwt from 'jsonwebtoken';
import { User, IUser } from '../../models';
import { AppError } from '../../middleware/error.middleware';

interface RegisterInput {
  email: string;
  username: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface AuthResult {
  user: Omit<IUser, 'password'>;
  token: string;
}

const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET || 'default-secret';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign({ id: userId }, secret, { expiresIn });
};

export const authService = {
  async register({ email, username, password }: RegisterInput): Promise<AuthResult> {
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError(400, 'Email already registered');
    }

    // Create user
    const user = await User.create({
      email,
      username,
      password,
    });

    const token = generateToken(user.id);

    return {
      user: user.toJSON() as Omit<IUser, 'password'>,
      token,
    };
  },

  async login({ email, password }: LoginInput): Promise<AuthResult> {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError(401, 'Invalid email or password');
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError(401, 'Invalid email or password');
    }

    // Update status
    user.status = 'online';
    await user.save();

    const token = generateToken(user.id);

    return {
      user: user.toJSON() as Omit<IUser, 'password'>,
      token,
    };
  },
};
