import { Router } from "express";
import { sessionsController } from "../composition/compositionRoot";

export const devicesRouter = Router({});

devicesRouter.get(
  "/",
  sessionsController.getSessionsByUserId.bind(sessionsController)
);

devicesRouter.delete(
  "/",
  sessionsController.deleteAllSessionsExceptCurrent.bind(sessionsController)
);

devicesRouter.delete(
  "/:deviceId",
  sessionsController.deleteSessionByDeviceId.bind(sessionsController)
);
