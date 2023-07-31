import { Router } from "express";
import { body } from "express-validator";
import { inputValidationMiddleware } from "../middlewares/inputValidationMiddleware";
import { bearerAuthMiddleware } from "../middlewares/bearerAuthMiddleware";
import { commentsController } from "../composition/compositionRoot";
import { isValidLikeStatus } from "../middlewares/likeStatusValidationMiddleware";

export const commentsRouter = Router({});

export const contentValidationMiddleware = body("content")
  .isString()
  .trim()
  .isLength({ min: 20, max: 300 })
  .withMessage("Incorrect value for content");

export const likeStatusValidationMiddleware =
  body("likeStatus").custom(isValidLikeStatus);

commentsRouter.get(
  "/:commentId",
  commentsController.getCommentById.bind(commentsController)
);

commentsRouter.put(
  "/:commentId",
  bearerAuthMiddleware,
  contentValidationMiddleware,
  inputValidationMiddleware,
  commentsController.updateComment.bind(commentsController)
);

commentsRouter.delete(
  "/:commentId",
  bearerAuthMiddleware,
  commentsController.deleteComment.bind(commentsController)
);

commentsRouter.put(
  "/:commentId/like-status",
  bearerAuthMiddleware,
  likeStatusValidationMiddleware,
  inputValidationMiddleware,
  commentsController.updateLikeStatus.bind(commentsController)
);
