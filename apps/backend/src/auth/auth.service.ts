import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../database/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  private hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  async register(email: string, password: string, name?: string) {
    const existing = await this.userModel.findOne({ email }).lean();
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const user = await this.userModel.create({
      email,
      password: this.hashPassword(password),
      name: name || email.split('@')[0],
    });

    const tokens = await this.generateTokens(user);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  async login(email: string, password: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValidPassword = await this.validatePassword(password, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const hashedPassword = this.hashPassword(password);
    if (user.password !== hashedPassword) {
      user.password = hashedPassword;
    }

    user.lastActiveAt = new Date();
    await user.save();

    const tokens = await this.generateTokens(user);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  async oauthCallback(supabaseToken: string) {
    // In production, verify supabaseToken with Supabase admin API
    // For now, decode and extract user info
    try {
      const decoded = JSON.parse(
        Buffer.from(supabaseToken.split('.')[1], 'base64').toString(),
      );

      let user = await this.userModel.findOne({
        $or: [{ supabaseId: decoded.sub }, { email: decoded.email }],
      });

      if (!user) {
        user = await this.userModel.create({
          email: decoded.email,
          supabaseId: decoded.sub,
          name: decoded.user_metadata?.full_name || decoded.email.split('@')[0],
          avatar: decoded.user_metadata?.avatar_url || '',
        });
      } else if (!user.supabaseId) {
        user.supabaseId = decoded.sub;
        await user.save();
      }

      user.lastActiveAt = new Date();
      await user.save();

      const tokens = await this.generateTokens(user);
      return { user: this.sanitizeUser(user), ...tokens };
    } catch {
      throw new UnauthorizedException('Invalid Supabase token');
    }
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET', 'techprep-dev-refresh-secret'),
      });

      const user = await this.userModel.findById(payload.sub);
      if (!user || user.refreshToken !== this.hashToken(refreshToken)) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const tokens = await this.generateTokens(user);
      return tokens;
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string) {
    await this.userModel.findByIdAndUpdate(userId, { refreshToken: null });
    return { success: true };
  }

  async getMe(userId: string) {
    const user = await this.userModel.findById(userId).lean();
    if (!user) throw new UnauthorizedException('User not found');
    return this.sanitizeUser(user);
  }

  private async generateTokens(user: UserDocument) {
    const payload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
      plan: user.plan,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET', 'techprep-dev-jwt-secret'),
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET', 'techprep-dev-refresh-secret'),
      expiresIn: '7d',
    });

    // Store hashed refresh token
    user.refreshToken = this.hashToken(refreshToken);
    await user.save();

    return { accessToken, refreshToken };
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private async validatePassword(password: string, storedPassword: string): Promise<boolean> {
    if (!storedPassword) return false;

    const hashedPassword = this.hashPassword(password);
    if (storedPassword === hashedPassword) {
      return true;
    }

    if (storedPassword.startsWith('$2')) {
      return bcrypt.compare(password, storedPassword);
    }

    return false;
  }

  private sanitizeUser(user: any) {
    const { password, refreshToken, __v, ...sanitized } = user.toObject ? user.toObject() : user;
    return sanitized;
  }
}
