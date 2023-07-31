import { JWTService } from "../application/jwtService";
import { AuthController } from "../controllers/authController";
import { BlogsController } from "../controllers/blogsController";
import { CommentsController } from "../controllers/commentsController";
import { SessionsController } from "../controllers/devicesController";
import { PostsController } from "../controllers/postsController";
import { UsersController } from "../controllers/usersController";
import { BlogsService } from "../domains/blogsService";
import { CommentsService } from "../domains/commentsService";
import { PostsService } from "../domains/postsService";
import { RecoveryCodesService } from "../domains/recoveryCodesService";
import { SessionsService } from "../domains/sessionsService";
import { UsersService } from "../domains/usersService";
import { BlogsQueryRepository } from "../repositories/blogsQueryRepository";
import { BlogsRepository } from "../repositories/blogsRepository";
import { CommentsQueryRepository } from "../repositories/commentsQueryRepository";
import { CommentsRepository } from "../repositories/commentsRepository";
import { PostsQueryRepository } from "../repositories/postsQueryRepository";
import { PostsRepository } from "../repositories/postsRepository";
import { RecoveryCodesRepository } from "../repositories/recoveryCodesRepository";
import { SessionsRepository } from "../repositories/sessionsRepository";
import { UsersQueryRepository } from "../repositories/usersQueryRepository";
import { UsersRepository } from "../repositories/usersRepository";

// -----------------------JWT----------------- //

export const jwtService = new JWTService();

// -----------------------User----------------- //

export const usersRepository = new UsersRepository();

const usersQueryRepository = new UsersQueryRepository();

export const usersService = new UsersService(usersRepository);

export const usersController = new UsersController(
  usersService,
  usersQueryRepository
);

// -----------------------Comment----------------- //

export const commentsQueryRepository = new CommentsQueryRepository();

export const commentsRepository = new CommentsRepository();

export const commentsService = new CommentsService(
  commentsRepository,
  usersRepository
);

export const commentsController = new CommentsController(
  commentsService,
  commentsQueryRepository,
  jwtService
);

// -----------------------Blog----------------- //

export const blogsRepository = new BlogsRepository();

// -----------------------Post----------------- //

export const postsQueryRepository = new PostsQueryRepository();

export const postsRepository = new PostsRepository();

export const postsService = new PostsService(postsRepository, blogsRepository);

export const postsController = new PostsController(
  postsService,
  postsQueryRepository,
  commentsQueryRepository,
  commentsService,
  jwtService
);

// -----------------------Blog----------------- //

const blogsQueryRepository = new BlogsQueryRepository();

const blogsService = new BlogsService(blogsRepository);

export const blogsController = new BlogsController(
  blogsService,
  blogsQueryRepository,
  postsService,
  postsQueryRepository,
  jwtService
);

// -----------------------RecoveryCode----------------- //

export const recoveryCodesRepository = new RecoveryCodesRepository();

export const recoveryCodesService = new RecoveryCodesService(
  recoveryCodesRepository
);

// -----------------------Session----------------- //

export const sessionsRepository = new SessionsRepository();

export const sessionsService = new SessionsService(
  sessionsRepository,
  jwtService
);

export const sessionsController = new SessionsController(
  sessionsService,
  jwtService
);

// -----------------------Auth----------------- //

export const authController = new AuthController(
  jwtService,
  sessionsService,
  usersRepository,
  usersService,
  recoveryCodesService
);
