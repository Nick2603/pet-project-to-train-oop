import { v4 as uuidv4 } from "uuid";
import { DeleteResult } from "mongodb";
import { ISessionDBModel, ISessionViewModel } from "../types/ISession";
import { SessionsRepository } from "../repositories/sessionsRepository";
import { JWTService } from "../application/jwtService";
import { mapSessionDBTypeToViewType } from "../mappers/mapSessionDBTypeToViewType";

export class SessionsService {
  constructor(
    protected readonly sessionsRepository: SessionsRepository,
    protected readonly jwtService: JWTService
  ) {}

  async deleteAllSessionsExceptCurrent(
    tokenString: string,
    userId: string
  ): Promise<DeleteResult> {
    const metadata = await this.jwtService.getRefreshTokenMetadata(tokenString);
    let deviceId: string = "";

    if (metadata) {
      deviceId = metadata.deviceId;
    }

    return await this.sessionsRepository.deleteAllSessionsExceptCurrent(
      deviceId,
      userId
    );
  }

  async deleteSessionByDeviceId(
    deviceId: string,
    userId: string
  ): Promise<string | boolean> {
    const session = await this.sessionsRepository.getSessionByDeviceId(
      deviceId
    );

    if (session && session.userId !== userId) {
      return "Forbidden";
    }

    const result = await this.sessionsRepository.deleteSessionByDeviceId(
      deviceId
    );
    return result.deletedCount === 1;
  }

  async getSessionsByUserId(userId: string): Promise<ISessionViewModel[]> {
    const sessions = await this.sessionsRepository.getAllSessionsByUserId(
      userId
    );
    return sessions.map((session) => mapSessionDBTypeToViewType(session));
  }

  async addSession(
    token: string,
    ip: string,
    title: string,
    userId: string
  ): Promise<ISessionDBModel> {
    const metadata = await this.jwtService.getRefreshTokenMetadata(token);
    let deviceId: string = "";
    let issuedAt: string = "";

    if (metadata) {
      issuedAt = metadata.issuedAt;
      deviceId = metadata.deviceId;
    }

    const session = {
      id: uuidv4(),
      ip,
      title,
      lastActiveDate: issuedAt,
      deviceId,
      userId,
    };

    return await this.sessionsRepository.addSession(session);
  }

  async isRefreshTokenInSession(tokenString: string): Promise<boolean> {
    const allTokens = await this.sessionsRepository.getAllSessions();

    const metadata = await this.jwtService.getRefreshTokenMetadata(tokenString);
    let deviceId: string = "";
    let issuedAt: string = "";

    if (metadata) {
      issuedAt = metadata.issuedAt;
      deviceId = metadata.deviceId;
    }

    const match = allTokens.find(
      (t) => t.deviceId === deviceId && t.lastActiveDate === issuedAt
    );

    return Boolean(match);
  }

  async updateSession(
    oldTokenString: string,
    newTokenString: string
  ): Promise<boolean> {
    const oldMetadata = await this.jwtService.getRefreshTokenMetadata(
      oldTokenString
    );
    const newMetadata = await this.jwtService.getRefreshTokenMetadata(
      newTokenString
    );

    let oldDeviceId: string = "";
    let newIssuedAt: string = "";

    if (oldMetadata) {
      oldDeviceId = oldMetadata.deviceId;
    }

    if (newMetadata) {
      newIssuedAt = newMetadata.issuedAt;
    }

    return await this.sessionsRepository.updateSession(
      oldDeviceId,
      newIssuedAt
    );
  }

  async deleteSession(tokenString: string): Promise<DeleteResult> {
    const metadata = await this.jwtService.getRefreshTokenMetadata(tokenString);
    let deviceId: string = "";
    let issuedAt: string = "";

    if (metadata) {
      issuedAt = metadata.issuedAt;
      deviceId = metadata.deviceId;
    }

    return await this.sessionsRepository.deleteSession(deviceId, issuedAt);
  }
}
