import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { UserGroup } from "../models/entities/UserGroup";
import { User } from "../models/entities/User";
import { Group } from "../models/entities/Group";
import { BaseController } from "./BaseController";

export class UserGroupController extends BaseController {
  private get repository() {
    return AppDataSource.getRepository(UserGroup);
  }

  listar = this.handle(async (_req: Request, res: Response) => {
    const items = await this.repository.find({
      order: { joinedAt: "DESC" },
      relations: { user: true, group: true },
    });
    this.ok(res, items);
  });

  buscarPorIds = this.handle(async (req: Request, res: Response) => {
    const { userId, groupId } = req.params;

    if (!userId || !groupId) {
      this.badRequest(res, "Parâmetros obrigatórios: userId, groupId");
      return;
    }

    const item = await this.repository.findOne({
      where: { userId, groupId },
      relations: { user: true, group: true },
    });

    if (!item) {
      this.notFound(res, "Vínculo usuário-grupo não encontrado");
      return;
    }

    this.ok(res, item);
  });

  criar = this.handle(async (req: Request, res: Response) => {
    const { userId, groupId } = req.body;

    if (!userId || !groupId) {
      this.badRequest(res, "Campos obrigatórios: userId, groupId");
      return;
    }

    const user = await AppDataSource.getRepository(User).findOneBy({ id: userId });
    if (!user) {
      this.notFound(res, `Usuário ${userId} não encontrado`);
      return;
    }

    const group = await AppDataSource.getRepository(Group).findOneBy({ id: groupId });
    if (!group) {
      this.notFound(res, `Grupo ${groupId} não encontrado`);
      return;
    }

    const existente = await this.repository.findOneBy({ userId, groupId });
    if (existente) {
      this.badRequest(res, "Este usuário já pertence ao grupo");
      return;
    }

    const item = this.repository.create({ userId, groupId });
    const salvo = await this.repository.save(item);
    this.created(res, salvo);
  });

  remover = this.handle(async (req: Request, res: Response) => {
    const { userId, groupId } = req.params;

    if (!userId || !groupId) {
      this.badRequest(res, "Parâmetros obrigatórios: userId, groupId");
      return;
    }

    const item = await this.repository.findOneBy({ userId, groupId });

    if (!item) {
      this.notFound(res, "Vínculo usuário-grupo não encontrado");
      return;
    }

    await this.repository.remove(item);
    this.ok(res, { message: "Usuário removido do grupo" });
  });
}
