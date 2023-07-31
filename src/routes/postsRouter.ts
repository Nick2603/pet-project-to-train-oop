import { Router } from "express";
import { body } from "express-validator";
import { basicAuthMiddleware } from "../middlewares/basicAuthMiddleware";
import { isValidBlogId } from "../middlewares/blogIdValidationMiddleware";
import { inputValidationMiddleware } from "../middlewares/inputValidationMiddleware";
import { bearerAuthMiddleware } from "../middlewares/bearerAuthMiddleware";
import {
  contentValidationMiddleware,
  likeStatusValidationMiddleware,
} from "./commentsRouter";
import { postsController } from "../composition/compositionRoot";

export const postsRouter = Router({});

export const titleValidationMiddleware = body("title")
  .isString()
  .trim()
  .isLength({ min: 2, max: 30 })
  .withMessage("Incorrect value for title");

export const shortDescriptionValidationMiddleware = body("shortDescription")
  .isString()
  .trim()
  .isLength({ min: 2, max: 100 })
  .withMessage("Incorrect value for shortDescription");

export const contentDescriptionValidationMiddleware = body("content")
  .isString()
  .trim()
  .isLength({ min: 2, max: 1000 })
  .withMessage("Incorrect value for content");

const blogIdValidationMiddleware = body("blogId").custom(isValidBlogId);

postsRouter.get("/", postsController.getPosts.bind(postsController));

postsRouter.get("/:id", postsController.getPostById.bind(postsController));

postsRouter.post(
  "/",
  basicAuthMiddleware,
  titleValidationMiddleware,
  shortDescriptionValidationMiddleware,
  contentDescriptionValidationMiddleware,
  blogIdValidationMiddleware,
  inputValidationMiddleware,
  postsController.createPost.bind(postsController)
);

postsRouter.put(
  "/:id",
  basicAuthMiddleware,
  titleValidationMiddleware,
  shortDescriptionValidationMiddleware,
  contentDescriptionValidationMiddleware,
  blogIdValidationMiddleware,
  inputValidationMiddleware,
  postsController.updatePost.bind(postsController)
);

postsRouter.delete(
  "/:id",
  basicAuthMiddleware,
  postsController.deletePost.bind(postsController)
);

postsRouter.get(
  "/:postId/comments",
  postsController.getCommentsForPost.bind(postsController)
);

postsRouter.post(
  "/:postId/comments",
  bearerAuthMiddleware,
  contentValidationMiddleware,
  inputValidationMiddleware,
  postsController.createCommentForPost.bind(postsController)
);

postsRouter.put(
  "/:postId/like-status",
  bearerAuthMiddleware,
  likeStatusValidationMiddleware,
  inputValidationMiddleware,
  postsController.updateLikeStatus.bind(postsController)
);
