import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { GroupRole } from "../models/entities/GroupRole";
import { Group } from "../models/entities/Group";
import { Role } from "../models/entities/Role";
import { BaseController } from "./BaseController";

export class GroupRoleController extends BaseController {
  private get repository() {
    return AppDataSource.getRepository(GroupRole);
  }

  listar = this.handle(async (_req: Request, res: Response) => {
    const items = await this.repository.find({
      order: { grantedAt: "DESC" },
      relations: { group: true, role: true },
    });
    this.ok(res, items);
  });

  buscarPorIds = this.handle(async (req: Request, res: Response) => {
    const { groupId, roleId } = req.params;

    if (!groupId || !roleId) {
      this.badRequest(res, "Parâmetros obrigatórios: groupId, roleId");
      return;
    }

    const item = await this.repository.findOne({
      where: { groupId, roleId },
      relations: { group: true, role: true },
    });

    if (!item) {
      this.notFound(res, "Vínculo grupo-papel não encontrado");
      return;
    }

    this.ok(res, item);
  });

  criar = this.handle(async (req: Request, res: Response) => {
    const { groupId, roleId } = req.body;

    if (!groupId || !roleId) {
      this.badRequest(res, "Campos obrigatórios: groupId, roleId");
      return;
    }

    const group = await AppDataSource.getRepository(Group).findOneBy({ id: groupId });
    if (!group) {
      this.notFound(res, `Grupo ${groupId} não encontrado`);
      return;
    }

    const role = await AppDataSource.getRepository(Role).findOneBy({ id: roleId });
    if (!role) {
      this.notFound(res, `Papel ${roleId} não encontrado`);
      return;
    }

    const existente = await this.repository.findOneBy({ groupId, roleId });
    if (existente) {
      this.badRequest(res, "Este papel já está atribuído ao grupo");
      return;
    }

    const item = this.repository.create({ groupId, roleId });
    const salvo = await this.repository.save(item);
    this.created(res, salvo);
  });

  remover = this.handle(async (req: Request, res: Response) => {
    const { groupId, roleId } = req.params;

    if (!groupId || !roleId) {
      this.badRequest(res, "Parâmetros obrigatórios: groupId, roleId");
      return;
    }

    const item = await this.repository.findOneBy({ groupId, roleId });

    if (!item) {
      this.notFound(res, "Vínculo grupo-papel não encontrado");
      return;
    }

    await this.repository.remove(item);
    this.ok(res, { message: "Papel removido do grupo" });
  });
}
