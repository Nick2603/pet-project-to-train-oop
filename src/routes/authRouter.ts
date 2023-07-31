import { Router } from "express";
import { body } from "express-validator";
import { inputValidationMiddleware } from "../middlewares/inputValidationMiddleware";
import { bearerAuthMiddleware } from "../middlewares/bearerAuthMiddleware";
import {
  emailValidationMiddleware,
  loginValidationMiddleware,
  passwordValidationMiddleware,
} from "./usersRouter";
import { isUniqueEmail } from "../middlewares/isUniqueEmailMiddleware";
import { isUniqueLogin } from "../middlewares/isUniqueLoginMiddleware";
import { createRateLimitingMiddleware } from "../middlewares/rateLimitingMiddleware";
import { authController } from "../composition/compositionRoot";

export const authRouter = Router({});

export const loginOrEmailValidationMiddleware = body("loginOrEmail")
  .isString()
  .trim()
  .isLength({ min: 1, max: 40 })
  .withMessage("Incorrect value for loginOrEmail");

export const codeValidationMiddleware = body("code")
  .isString()
  .trim()
  .isLength({ min: 1, max: 500 })
  .withMessage("Incorrect value for code");

const emailUniquenessValidationMiddleware = body("email").custom(isUniqueEmail);

const loginUniquenessValidationMiddleware = body("login").custom(isUniqueLogin);

export const newPasswordValidationMiddleware = body("newPassword")
  .isString()
  .trim()
  .isLength({ min: 6, max: 20 })
  .withMessage("Incorrect value for password");

const loginRateLimitingMiddleware = createRateLimitingMiddleware(1000 * 10, 5);
const registrationRateLimitingMiddleware = createRateLimitingMiddleware(
  1000 * 10,
  5
);
const registrationConfirmationRateLimitingMiddleware =
  createRateLimitingMiddleware(1000 * 10, 5);
const emailResendingRateLimitingMiddleware = createRateLimitingMiddleware(
  1000 * 10,
  5
);
const passwordRecoveryRateLimitingMiddleware = createRateLimitingMiddleware(
  1000 * 10,
  5
);
const newPasswordReqRateLimitingMiddleware = createRateLimitingMiddleware(
  1000 * 10,
  5
);

authRouter.post(
  "/login",
  loginOrEmailValidationMiddleware,
  passwordValidationMiddleware,
  inputValidationMiddleware,
  loginRateLimitingMiddleware,
  authController.login.bind(authController)
);

authRouter.get(
  "/me",
  bearerAuthMiddleware,
  authController.me.bind(authController)
);

authRouter.post(
  "/registration",
  emailUniquenessValidationMiddleware,
  loginUniquenessValidationMiddleware,
  loginValidationMiddleware,
  passwordValidationMiddleware,
  emailValidationMiddleware,
  inputValidationMiddleware,
  registrationRateLimitingMiddleware,
  authController.registration.bind(authController)
);

authRouter.post(
  "/registration-confirmation",
  codeValidationMiddleware,
  inputValidationMiddleware,
  registrationConfirmationRateLimitingMiddleware,
  authController.registrationConfirmation.bind(authController)
);

authRouter.post(
  "/registration-email-resending",
  emailValidationMiddleware,
  emailResendingRateLimitingMiddleware,
  authController.registrationEmailResending.bind(authController)
);

authRouter.post(
  "/refresh-token",
  authController.refreshToken.bind(authController)
);

authRouter.post("/logout", authController.logout.bind(authController));

authRouter.post(
  "/password-recovery",
  emailValidationMiddleware,
  passwordRecoveryRateLimitingMiddleware,
  inputValidationMiddleware,
  authController.passwordRecovery.bind(authController)
);

authRouter.post(
  "/new-password",
  newPasswordValidationMiddleware,
  newPasswordReqRateLimitingMiddleware,
  inputValidationMiddleware,
  authController.newPassword.bind(authController)
);
