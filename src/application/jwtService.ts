import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { IUserViewModel } from "../types/IUser";

export class JWTService {
  async createJWTAccessToken(user: IUserViewModel) {
    const accessToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || "1",
      { expiresIn: 600 }
    );
    return { accessToken };
  }

  async createJWTRefreshToken(user: IUserViewModel, deviceId?: string) {
    return jwt.sign(
      {
        userId: user.id,
        deviceId: deviceId || uuidv4(),
        issuedAt: new Date().toISOString(),
      },
      process.env.JWT_SECRET || "1",
      { expiresIn: 600 }
    );
  }

  async getUserIdByToken(token: string) {
    try {
      const result: string | jwt.JwtPayload = jwt.verify(
        token,
        process.env.JWT_SECRET || "1"
      );
      return (result as jwt.JwtPayload).userId;
    } catch (error) {
      return null;
    }
  }

  async getRefreshTokenMetadata(token: string) {
    try {
      const result: string | jwt.JwtPayload = jwt.verify(
        token,
        process.env.JWT_SECRET || "1"
      );
      return {
        deviceId: (result as jwt.JwtPayload).deviceId,
        issuedAt: (result as jwt.JwtPayload).issuedAt,
      };
    } catch (error) {
      return null;
    }
  }
}
