import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { User } from "../models/entities/User";
import { BaseController } from "./BaseController";

export class UserController extends BaseController {
  private get repository() {
    return AppDataSource.getRepository(User);
  }

  listar = this.handle(async (_req: Request, res: Response) => {
    const users = await this.repository.find({
      order: { createdAt: "ASC" },
      relations: { userRoles: true, userGroups: true },
    });
    this.ok(res, users);
  });

  buscarPorId = this.handle(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      this.badRequest(res, "ID inválido");
      return;
    }

    const user = await this.repository.findOne({
      where: { id },
      relations: { userRoles: { role: true }, userGroups: { group: true } },
    });

    if (!user) {
      this.notFound(res, `Usuário ${id} não encontrado`);
      return;
    }

    this.ok(res, user);
  });

  criar = this.handle(async (req: Request, res: Response) => {
    const { username, email, passwordHash, isActive } = req.body;

    if (!username || !email || !passwordHash) {
      this.badRequest(res, "Campos obrigatórios: username, email, passwordHash");
      return;
    }

    const user = this.repository.create({
      username,
      email,
      passwordHash,
      isActive: isActive ?? true,
    });

    const salvo = await this.repository.save(user);
    this.created(res, salvo);
  });

  atualizar = this.handle(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      this.badRequest(res, "ID inválido");
      return;
    }

    const user = await this.repository.findOneBy({ id });

    if (!user) {
      this.notFound(res, `Usuário ${id} não encontrado`);
      return;
    }

    const { username, email, passwordHash, isActive, lastLogin } = req.body;

    if (username !== undefined) user.username = username;
    if (email !== undefined) user.email = email;
    if (passwordHash !== undefined) user.passwordHash = passwordHash;
    if (isActive !== undefined) user.isActive = isActive;
    if (lastLogin !== undefined) user.lastLogin = lastLogin;

    const atualizado = await this.repository.save(user);
    this.ok(res, atualizado);
  });

  remover = this.handle(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      this.badRequest(res, "ID inválido");
      return;
    }

    const user = await this.repository.findOneBy({ id });

    if (!user) {
      this.notFound(res, `Usuário ${id} não encontrado`);
      return;
    }

    await this.repository.remove(user);
    this.ok(res, { message: `Usuário ${id} removido` });
  });
}
