import { Request, Response } from "express";
import { UsersService } from "../domains/usersService";
import { UsersQueryRepository } from "../repositories/usersQueryRepository";
import { CodeResponsesEnum } from "../types/CodeResponsesEnum";

export class UsersController {
  constructor(
    protected readonly usersService: UsersService,
    protected readonly usersQueryRepository: UsersQueryRepository
  ) {}

  async getUsers(req: Request, res: Response) {
    const searchLoginTerm = req.query.searchLoginTerm;
    const searchEmailTerm = req.query.searchEmailTerm;
    const sortBy = req.query.sortBy;
    const sortDirection = req.query.sortDirection;
    const pageNumber = req.query.pageNumber;
    const pageSize = req.query.pageSize;
    const users = await this.usersQueryRepository.getUsers({
      searchLoginTerm,
      searchEmailTerm,
      sortBy,
      sortDirection,
      pageNumber,
      pageSize,
    });
    res.status(200).send(users);
  }

  async createUser(req: Request, res: Response) {
    const login = req.body.login;
    const password = req.body.password;
    const email = req.body.email;

    const newUser = await this.usersService.createUser(
      login,
      email,
      password,
      true
    );
    res.status(CodeResponsesEnum.Created_201).send(newUser);
  }

  async deleteUser(req: Request, res: Response) {
    const id = req.params.id;
    const result = await this.usersService.deleteUser(id);
    if (result) {
      res.sendStatus(CodeResponsesEnum.No_content_204);
      return;
    }
    res.sendStatus(CodeResponsesEnum.Not_found_404);
  }
}
