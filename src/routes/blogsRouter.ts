import { Router } from "express";
import { body } from "express-validator";
import { basicAuthMiddleware } from "../middlewares/basicAuthMiddleware";
import { inputValidationMiddleware } from "../middlewares/inputValidationMiddleware";
import {
  contentDescriptionValidationMiddleware,
  shortDescriptionValidationMiddleware,
  titleValidationMiddleware,
} from "./postsRouter";
import { blogsController } from "../composition/compositionRoot";

export const blogsRouter = Router({});

const nameValidationMiddleware = body("name")
  .isString()
  .trim()
  .isLength({ min: 2, max: 15 })
  .withMessage("Incorrect value for name");

const descriptionValidationMiddleware = body("description")
  .isString()
  .trim()
  .isLength({ min: 2, max: 500 })
  .withMessage("Incorrect value for description");

const websiteUrlValidationMiddleware = body("websiteUrl")
  .isString()
  .trim()
  .isLength({ min: 2, max: 100 })
  .matches("^https://([a-zA-Z0-9_-]+.)+[a-zA-Z0-9_-]+(/[a-zA-Z0-9_-]+)*/?$")
  .withMessage("Incorrect value for websiteUrl");

blogsRouter.get("/", blogsController.getBlogs.bind(blogsController));

blogsRouter.get("/:id", blogsController.getBlogById.bind(blogsController));

blogsRouter.post(
  "/",
  basicAuthMiddleware,
  nameValidationMiddleware,
  descriptionValidationMiddleware,
  websiteUrlValidationMiddleware,
  inputValidationMiddleware,
  blogsController.createBlog.bind(blogsController)
);

blogsRouter.put(
  "/:id",
  basicAuthMiddleware,
  nameValidationMiddleware,
  descriptionValidationMiddleware,
  websiteUrlValidationMiddleware,
  inputValidationMiddleware,
  blogsController.updateBlog.bind(blogsController)
);

blogsRouter.delete(
  "/:id",
  basicAuthMiddleware,
  blogsController.deleteBlog.bind(blogsController)
);

blogsRouter.get(
  "/:blogId/posts",
  blogsController.getPostsForBlog.bind(blogsController)
);

blogsRouter.post(
  "/:blogId/posts",
  basicAuthMiddleware,
  titleValidationMiddleware,
  shortDescriptionValidationMiddleware,
  contentDescriptionValidationMiddleware,
  inputValidationMiddleware,
  blogsController.createPostForBlog.bind(blogsController)
);
