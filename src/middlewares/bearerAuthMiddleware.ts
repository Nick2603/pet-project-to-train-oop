import { NextFunction, Request, Response } from "express";
import { CodeResponsesEnum } from "../types/CodeResponsesEnum";
import { IUserDBModel } from "../types/IUser";
import { jwtService, usersService } from "../composition/compositionRoot";

export const bearerAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.headers.authorization) {
    res.sendStatus(CodeResponsesEnum.Unauthorized_401);
    return;
  }

  const token = req.headers.authorization.split(" ")[1];
  const userId = await jwtService.getUserIdByToken(token);

  if (!userId) {
    res.sendStatus(CodeResponsesEnum.Unauthorized_401);
    return;
  }

  req.user = (await usersService.getUserDBModelById(userId)) as IUserDBModel;
  next();
};
