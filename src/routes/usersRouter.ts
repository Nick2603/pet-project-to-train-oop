import { Router } from "express";
import { body } from "express-validator";
import { basicAuthMiddleware } from "../middlewares/basicAuthMiddleware";
import { inputValidationMiddleware } from "../middlewares/inputValidationMiddleware";
import { usersController } from "../composition/compositionRoot";

export const usersRouter = Router({});

export const loginValidationMiddleware = body("login")
  .isString()
  .trim()
  .isLength({ min: 3, max: 10 })
  .matches("^[a-zA-Z0-9_-]*$")
  .withMessage("Incorrect value for login");

export const passwordValidationMiddleware = body("password")
  .isString()
  .trim()
  .isLength({ min: 6, max: 20 })
  .withMessage("Incorrect value for password");

export const emailValidationMiddleware = body("email")
  .isString()
  .trim()
  .isLength({ min: 3, max: 40 })
  .matches("^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$")
  .withMessage("Incorrect value for email");

usersRouter.get(
  "/",
  basicAuthMiddleware,
  usersController.getUsers.bind(usersController)
);

usersRouter.post(
  "/",
  basicAuthMiddleware,
  loginValidationMiddleware,
  passwordValidationMiddleware,
  emailValidationMiddleware,
  inputValidationMiddleware,
  usersController.createUser.bind(usersController)
);

usersRouter.delete(
  "/:id",
  basicAuthMiddleware,
  usersController.deleteUser.bind(usersController)
);
