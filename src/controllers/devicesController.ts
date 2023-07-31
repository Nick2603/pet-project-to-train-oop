import { Request, Response } from "express";
import { SessionsService } from "../domains/sessionsService";
import { JWTService } from "../application/jwtService";
import { CodeResponsesEnum } from "../types/CodeResponsesEnum";

export class SessionsController {
  constructor(
    protected readonly sessionsService: SessionsService,
    protected readonly jwtService: JWTService
  ) {}

  async getSessionsByUserId(req: Request, res: Response) {
    const refreshTokenFromReq = req.cookies["refreshToken"];
    if (!refreshTokenFromReq) {
      return res.status(401).send("Access Denied. No refresh token provided.");
    }

    const userId = await this.jwtService.getUserIdByToken(refreshTokenFromReq);
    if (!userId) {
      return res
        .status(401)
        .send("Access Denied. Incorrect refresh token provided.");
    }

    const sessions = await this.sessionsService.getSessionsByUserId(userId);

    res.status(200).send(sessions);
  }

  async deleteAllSessionsExceptCurrent(req: Request, res: Response) {
    const refreshTokenFromReq = req.cookies["refreshToken"];
    if (!refreshTokenFromReq) {
      return res.status(401).send("Access Denied. No refresh token provided.");
    }

    const userId = await this.jwtService.getUserIdByToken(refreshTokenFromReq);
    if (!userId) {
      return res
        .status(401)
        .send("Access Denied. Incorrect refresh token provided.");
    }

    const result = await this.sessionsService.deleteAllSessionsExceptCurrent(
      refreshTokenFromReq,
      userId
    );
    if (result) {
      res.sendStatus(CodeResponsesEnum.No_content_204);
      return;
    }
    res.sendStatus(CodeResponsesEnum.Not_found_404);
  }

  async deleteSessionByDeviceId(req: Request, res: Response) {
    const deviceId = req.params.deviceId;
    const refreshTokenFromReq = req.cookies["refreshToken"];
    if (!refreshTokenFromReq) {
      return res.status(401).send("Access Denied. No refresh token provided.");
    }

    const userId = await this.jwtService.getUserIdByToken(refreshTokenFromReq);
    if (!userId) {
      return res
        .status(401)
        .send("Access Denied. Incorrect refresh token provided.");
    }

    const result = await this.sessionsService.deleteSessionByDeviceId(
      deviceId,
      userId
    );
    if (result === true) {
      res.sendStatus(CodeResponsesEnum.No_content_204);
      return;
    }

    if (result === "Forbidden") {
      res.sendStatus(CodeResponsesEnum.Forbidden_403);
      return;
    }

    res.sendStatus(CodeResponsesEnum.Not_found_404);
  }
}
