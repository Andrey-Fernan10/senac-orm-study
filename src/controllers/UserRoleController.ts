import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { UserRole } from "../models/entities/UserRole";
import { User } from "../models/entities/User";
import { Role } from "../models/entities/Role";
import { BaseController } from "./BaseController";

export class UserRoleController extends BaseController {
  private get repository() {
    return AppDataSource.getRepository(UserRole);
  }

  listar = this.handle(async (_req: Request, res: Response) => {
    const items = await this.repository.find({
      order: { grantedAt: "DESC" },
      relations: { user: true, role: true, grantedByUser: true },
    });
    this.ok(res, items);
  });

  buscarPorIds = this.handle(async (req: Request, res: Response) => {
    const { userId, roleId } = req.params;

    if (!userId || !roleId) {
      this.badRequest(res, "Parâmetros obrigatórios: userId, roleId");
      return;
    }

    const item = await this.repository.findOne({
      where: { userId, roleId },
      relations: { user: true, role: true, grantedByUser: true },
    });

    if (!item) {
      this.notFound(res, "Vínculo usuário-papel não encontrado");
      return;
    }

    this.ok(res, item);
  });

  criar = this.handle(async (req: Request, res: Response) => {
    const { userId, roleId, grantedBy } = req.body;

    if (!userId || !roleId) {
      this.badRequest(res, "Campos obrigatórios: userId, roleId");
      return;
    }

    const userRepo = AppDataSource.getRepository(User);
    const roleRepo = AppDataSource.getRepository(Role);

    const user = await userRepo.findOneBy({ id: userId });
    if (!user) {
      this.notFound(res, `Usuário ${userId} não encontrado`);
      return;
    }

    const role = await roleRepo.findOneBy({ id: roleId });
    if (!role) {
      this.notFound(res, `Papel ${roleId} não encontrado`);
      return;
    }

    const existente = await this.repository.findOneBy({ userId, roleId });
    if (existente) {
      this.badRequest(res, "Este papel já está atribuído ao usuário");
      return;
    }

    if (grantedBy) {
      const grantor = await userRepo.findOneBy({ id: grantedBy });
      if (!grantor) {
        this.notFound(res, `Usuário concedente ${grantedBy} não encontrado`);
        return;
      }
    }

    const item = this.repository.create({
      userId,
      roleId,
      grantedBy: grantedBy ?? null,
    });

    const salvo = await this.repository.save(item);
    this.created(res, salvo);
  });

  remover = this.handle(async (req: Request, res: Response) => {
    const { userId, roleId } = req.params;

    if (!userId || !roleId) {
      this.badRequest(res, "Parâmetros obrigatórios: userId, roleId");
      return;
    }

    const item = await this.repository.findOneBy({ userId, roleId });

    if (!item) {
      this.notFound(res, "Vínculo usuário-papel não encontrado");
      return;
    }

    await this.repository.remove(item);
    this.ok(res, { message: "Papel removido do usuário" });
  });
}
