import { Request, Response } from "express";
import { authService } from "../domains/authService";
import { CodeResponsesEnum } from "../types/CodeResponsesEnum";
import { JWTService } from "../application/jwtService";
import { SessionsService } from "../domains/sessionsService";
import { mapUserDBTypeToViewType } from "../mappers/mapUserDBTypeToViewType";
import { UsersService } from "../domains/usersService";
import { RecoveryCodesService } from "../domains/recoveryCodesService";
import { UsersRepository } from "../repositories/usersRepository";

export class AuthController {
  constructor(
    protected readonly jwtService: JWTService,
    protected readonly sessionsService: SessionsService,
    protected readonly usersRepository: UsersRepository,
    protected readonly usersService: UsersService,
    protected readonly recoveryCodesService: RecoveryCodesService
  ) {}

  async login(req: Request, res: Response) {
    const loginOrEmail = req.body.loginOrEmail;
    const password = req.body.password;
    const user = await authService.checkCredentials(loginOrEmail, password);
    const { ip } = req;
    const deviceTitle = req.headers["user-agent"] || "myDevice";

    if (!user) {
      res.sendStatus(CodeResponsesEnum.Unauthorized_401);
      return;
    }

    const accessToken = await this.jwtService.createJWTAccessToken(user);
    const refreshToken = await this.jwtService.createJWTRefreshToken(user);

    await this.sessionsService.addSession(
      refreshToken,
      ip,
      deviceTitle,
      user.id.toString()
    );

    res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        maxAge: 20,
      })
      .status(CodeResponsesEnum.Ok_200)
      .send(accessToken);
  }

  async me(req: Request, res: Response) {
    res.send({
      email: req.user!.accountData.email,
      login: req.user!.accountData.login,
      userId: req.user!.id,
    });
  }

  async registration(req: Request, res: Response) {
    const login = req.body.login;
    const email = req.body.email;
    const password = req.body.password;

    const result = await authService.createUser(login, email, password);
    if (!result) return res.sendStatus(CodeResponsesEnum.Incorrect_values_400);
    res.sendStatus(CodeResponsesEnum.No_content_204);
  }

  async registrationConfirmation(req: Request, res: Response) {
    const code = req.body.code;

    const result = await authService.confirmEmail(code);
    if (result === false)
      return res.send(CodeResponsesEnum.Incorrect_values_400);
    if (typeof result !== "boolean")
      return res.status(CodeResponsesEnum.Incorrect_values_400).send(result);
    res.sendStatus(CodeResponsesEnum.No_content_204);
  }

  async registrationEmailResending(req: Request, res: Response) {
    const email = req.body.email;

    const result = await authService.resendEmail(email);
    if (result === false)
      return res.sendStatus(CodeResponsesEnum.Incorrect_values_400);
    if (typeof result !== "boolean")
      return res.status(CodeResponsesEnum.Incorrect_values_400).send(result);
    res.sendStatus(CodeResponsesEnum.No_content_204);
  }

  async refreshToken(req: Request, res: Response) {
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

    const isRefreshTokenInSession =
      this.sessionsService.isRefreshTokenInSession(refreshTokenFromReq);

    if (!isRefreshTokenInSession) {
      return res
        .status(401)
        .send("Access Denied. Incorrect refresh token provided.");
    }

    const dbUser = await this.usersService.getUserDBModelById(userId);

    if (!dbUser) {
      return res.status(401).send("User not found.");
    }

    const user = mapUserDBTypeToViewType(dbUser);

    const metadata = await this.jwtService.getRefreshTokenMetadata(
      refreshTokenFromReq
    );
    let deviceId: string = "";

    if (metadata) {
      deviceId = metadata.deviceId;
    }

    const accessToken = await this.jwtService.createJWTAccessToken(user);
    const refreshToken = await this.jwtService.createJWTRefreshToken(
      user,
      deviceId
    );

    await this.sessionsService.updateSession(refreshTokenFromReq, refreshToken);

    res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        maxAge: 20,
      })
      .status(CodeResponsesEnum.Ok_200)
      .send(accessToken);
  }

  async logout(req: Request, res: Response) {
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

    const isRefreshTokenInSession =
      this.sessionsService.isRefreshTokenInSession(refreshTokenFromReq);

    if (!isRefreshTokenInSession) {
      return res
        .status(401)
        .send("Access Denied. Incorrect refresh token provided.");
    }

    await this.sessionsService.deleteSession(refreshTokenFromReq);
    res.clearCookie("refreshToken");
    res.sendStatus(CodeResponsesEnum.No_content_204);
  }

  async passwordRecovery(req: Request, res: Response) {
    const email = req.body.email;

    await this.recoveryCodesService.addRecoveryCode(email);

    res.sendStatus(CodeResponsesEnum.No_content_204);
  }

  async newPassword(req: Request, res: Response) {
    const newPassword = req.body.newPassword;
    const recoveryCode = req.body.recoveryCode;

    const validCode = await this.recoveryCodesService.validateRecoveryCode(
      recoveryCode
    );

    if (!validCode)
      return res.status(400).send({
        errorsMessages: [
          {
            message: "incorrect value for recoveryCode",
            field: "recoveryCode",
          },
        ],
      });

    const user = await this.usersRepository.getUserByEmail(validCode.email);

    if (!user) return res.sendStatus(CodeResponsesEnum.Incorrect_values_400);

    const result = this.usersService.updateUserPassword(user.id, newPassword);

    if (!result) return res.sendStatus(CodeResponsesEnum.Incorrect_values_400);

    res.sendStatus(CodeResponsesEnum.No_content_204);
  }
}
